from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal

from .models import Trip, TripExpense, DriverEarningsSummary
from .serializers import (
    TripSerializer, TripCreateSerializer, TripSummarySerializer,
    TripExpenseSerializer, DriverEarningsSummarySerializer,
    TripStatsSerializer
)
from drivers.models import Driver


class TripViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing trips with comprehensive filtering and analytics
    """
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [AllowAny]  # For development - change in production
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = [
        'driver', 'company', 'status', 'payment_method', 'trip_type'
    ]
    search_fields = [
        'trip_id', 'customer_name', 'pickup_location', 'dropoff_location'
    ]
    ordering_fields = [
        'created_at', 'total_fare', 'distance_km', 'duration_minutes'
    ]
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return TripCreateSerializer
        elif self.action == 'list':
            return TripSummarySerializer
        return TripSerializer

    def get_queryset(self):
        """Filter trips based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by driver
        driver_id = self.request.query_params.get('driver_id')
        if driver_id:
            queryset = queryset.filter(driver_id=driver_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__lte=end_date)
            except ValueError:
                pass
        
        return queryset

    @action(detail=False, methods=['get'])
    def driver_trips(self, request):
        """Get trips for a specific driver with pagination"""
        driver_id = request.query_params.get('driver_id')
        if not driver_id:
            return Response(
                {'error': 'driver_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            driver = Driver.objects.get(id=driver_id)
        except Driver.DoesNotExist:
            return Response(
                {'error': 'Driver not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        trips = self.get_queryset().filter(driver=driver)
        page = self.paginate_queryset(trips)
        
        if page is not None:
            serializer = TripSummarySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = TripSummarySerializer(trips, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def driver_stats(self, request):
        """Get comprehensive statistics for a driver"""
        driver_id = request.query_params.get('driver_id')
        if not driver_id:
            return Response(
                {'error': 'driver_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get date range (default to current month)
        end_date = timezone.now().date()
        start_date = end_date.replace(day=1)
        
        if request.query_params.get('start_date'):
            try:
                start_date = datetime.strptime(
                    request.query_params.get('start_date'), '%Y-%m-%d'
                ).date()
            except ValueError:
                pass
        
        if request.query_params.get('end_date'):
            try:
                end_date = datetime.strptime(
                    request.query_params.get('end_date'), '%Y-%m-%d'
                ).date()
            except ValueError:
                pass
        
        # Get trips in date range
        trips = Trip.objects.filter(
            driver_id=driver_id,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        # Calculate statistics
        stats = trips.aggregate(
            total_trips=Count('id'),
            completed_trips=Count('id', filter=Q(status='completed')),
            cancelled_trips=Count('id', filter=Q(status='cancelled')),
            total_earnings=Sum('driver_earnings'),
            total_tips=Sum('tip_amount'),
            total_distance=Sum('distance_km'),
            total_duration=Sum('duration_minutes'),
            cash_earnings=Sum('driver_earnings', filter=Q(payment_method='cash')),
            digital_earnings=Sum('driver_earnings', filter=Q(payment_method__in=['digital', 'card', 'wallet']))
        )
        
        # Handle None values
        for key, value in stats.items():
            if value is None:
                stats[key] = 0
        
        # Calculate averages
        completed_trips = stats['completed_trips']
        if completed_trips > 0:
            stats['average_trip_earnings'] = round(
                float(stats['total_earnings']) / completed_trips, 2
            )
            stats['average_trip_distance'] = round(
                float(stats['total_distance']) / completed_trips, 2
            )
        else:
            stats['average_trip_earnings'] = 0
            stats['average_trip_distance'] = 0
        
        # Count payment method trips
        stats['cash_trips'] = trips.filter(payment_method='cash').count()
        stats['digital_trips'] = trips.filter(
            payment_method__in=['digital', 'card', 'wallet']
        ).count()
        
        serializer = TripStatsSerializer(data=stats)
        serializer.is_valid(raise_exception=True)
        
        return Response({
            'driver_id': driver_id,
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'stats': serializer.data
        })

    @action(detail=False, methods=['get'])
    def recent_trips(self, request):
        """Get recent trips for a driver (last 10)"""
        driver_id = request.query_params.get('driver_id')
        if not driver_id:
            return Response(
                {'error': 'driver_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        trips = Trip.objects.filter(driver_id=driver_id).order_by('-created_at')[:10]
        serializer = TripSummarySerializer(trips, many=True)
        
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete_trip(self, request, pk=None):
        """Mark a trip as completed"""
        trip = self.get_object()
        
        if trip.status != 'in_progress':
            return Response(
                {'error': 'Trip must be in progress to complete'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        trip.mark_completed()
        serializer = self.get_serializer(trip)
        
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel_trip(self, request, pk=None):
        """Cancel a trip"""
        trip = self.get_object()
        reason = request.data.get('reason', '')
        
        if trip.status in ['completed', 'cancelled']:
            return Response(
                {'error': 'Cannot cancel completed or already cancelled trip'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        trip.mark_cancelled(reason)
        serializer = self.get_serializer(trip)
        
        return Response(serializer.data)


class TripExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing trip expenses"""
    
    queryset = TripExpense.objects.all()
    serializer_class = TripExpenseSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['trip', 'expense_type', 'is_reimbursable', 'is_reimbursed']
    ordering = ['-expense_date']

    def get_queryset(self):
        """Filter expenses by trip or driver"""
        queryset = super().get_queryset()
        
        trip_id = self.request.query_params.get('trip_id')
        if trip_id:
            queryset = queryset.filter(trip_id=trip_id)
        
        driver_id = self.request.query_params.get('driver_id')
        if driver_id:
            queryset = queryset.filter(trip__driver_id=driver_id)
        
        return queryset


class DriverEarningsSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for driver earnings summaries (read-only)"""
    
    queryset = DriverEarningsSummary.objects.all()
    serializer_class = DriverEarningsSummarySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['driver', 'period_type']
    ordering = ['-period_start']

    def get_queryset(self):
        """Filter summaries by driver"""
        queryset = super().get_queryset()
        
        driver_id = self.request.query_params.get('driver_id')
        if driver_id:
            queryset = queryset.filter(driver_id=driver_id)
        
        return queryset

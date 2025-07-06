from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Transaction, Income, Expense
from .serializers import TransactionSerializer, IncomeSerializer, ExpenseSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing financial transactions"""
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter parameters
        transaction_type = self.request.query_params.get('type')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
            
        return queryset

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get transaction summary"""
        queryset = self.get_queryset()
        
        total_income = queryset.filter(transaction_type='income').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        total_expense = queryset.filter(transaction_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        return Response({
            'total_income': total_income,
            'total_expense': total_expense,
            'net_profit': total_income - total_expense,
            'transaction_count': queryset.count()
        })


class IncomeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing income records"""
    queryset = Income.objects.all().order_by('-created_at')
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly income summary"""
        now = timezone.now()
        current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        monthly_income = self.queryset.filter(
            created_at__gte=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'current_month_income': monthly_income,
            'month': current_month.strftime('%B %Y')
        })


class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing expense records"""
    queryset = Expense.objects.all().order_by('-created_at')
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly expense summary"""
        now = timezone.now()
        current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        monthly_expense = self.queryset.filter(
            created_at__gte=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'current_month_expense': monthly_expense,
            'month': current_month.strftime('%B %Y')
        })


class AccountingDashboardView(APIView):
    """Dashboard view for accounting overview"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get accounting dashboard data"""
        now = timezone.now()
        current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month = (current_month - timedelta(days=1)).replace(day=1)
        
        # Current month data
        current_income = Income.objects.filter(
            created_at__gte=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        current_expense = Expense.objects.filter(
            created_at__gte=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Last month data
        last_month_income = Income.objects.filter(
            created_at__gte=last_month,
            created_at__lt=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        last_month_expense = Expense.objects.filter(
            created_at__gte=last_month,
            created_at__lt=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Recent transactions
        recent_transactions = Transaction.objects.all().order_by('-created_at')[:10]
        
        return Response({
            'current_month': {
                'income': current_income,
                'expense': current_expense,
                'profit': current_income - current_expense,
                'month': current_month.strftime('%B %Y')
            },
            'last_month': {
                'income': last_month_income,
                'expense': last_month_expense,
                'profit': last_month_income - last_month_expense,
                'month': last_month.strftime('%B %Y')
            },
            'recent_transactions': TransactionSerializer(recent_transactions, many=True).data,
            'total_transactions': Transaction.objects.count(),
            'total_income_sources': Income.objects.values('source').distinct().count(),
            'total_expense_categories': Expense.objects.values('category').distinct().count()
        })

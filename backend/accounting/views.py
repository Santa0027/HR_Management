from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from django.http import JsonResponse
from core.permissions import (
    IsAdminUser, IsAccountantUser, IsHRUser, IsStaffUser,
    can_view_financial_data, can_modify_financial_data
)

from .models import (
    AccountingCategory, PaymentMethod, BankAccount, Transaction,
    Income, Expense, DriverPayroll, Budget, FinancialReport, RecurringTransaction
)
from .serializers import (
    AccountingCategorySerializer, PaymentMethodSerializer, BankAccountSerializer,
    TransactionSerializer, IncomeSerializer, ExpenseSerializer, DriverPayrollSerializer,
    BudgetSerializer, FinancialReportSerializer, RecurringTransactionSerializer,
    TransactionSummarySerializer, CategorySummarySerializer, DriverPayrollSummarySerializer
)


class AccountingCategoryViewSet(viewsets.ModelViewSet):
    queryset = AccountingCategory.objects.all()
    serializer_class = AccountingCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'category_type', 'created_at']
    ordering = ['category_type', 'name']

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAccountantUser]
        else:
            # Only allow users who can view accounting data
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Filter queryset based on user role and permissions.
        """
        queryset = super().get_queryset()
        user = self.request.user

        # Only allow users with accounting permissions to view categories
        if user.role in ['admin', 'accountant', 'hr', 'management']:
            return queryset
        else:
            return queryset.none()


class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAccountantUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


class BankAccountViewSet(viewsets.ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['account_type', 'is_active', 'company', 'currency']
    search_fields = ['account_name', 'bank_name', 'account_number']
    ordering_fields = ['bank_name', 'account_name', 'balance', 'created_at']
    ordering = ['bank_name', 'account_name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'update_balance']:
            permission_classes = [IsAccountantUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'])
    def update_balance(self, request, pk=None):
        """Update bank account balance"""
        bank_account = self.get_object()
        new_balance = request.data.get('balance')

        if new_balance is None:
            return Response(
                {'error': 'Balance is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            bank_account.balance = Decimal(str(new_balance))
            bank_account.save()
            return Response({'message': 'Balance updated successfully'})
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid balance amount'},
                status=status.HTTP_400_BAD_REQUEST
            )


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'transaction_type', 'status', 'category', 'payment_method',
        'bank_account', 'company', 'driver', 'created_by'
    ]
    search_fields = ['transaction_id', 'description', 'reference_number']
    ordering_fields = ['transaction_date', 'amount', 'created_at']
    ordering = ['-transaction_date', '-created_at']

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAccountantUser]
        else:
            # Allow HR and Management to view transactions
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Filter queryset based on user role and permissions.
        """
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == 'admin':
            return queryset
        elif user.role in ['accountant', 'hr', 'management']:
            return queryset
        elif user.role == 'driver':
            # Drivers can only see their own transactions
            return queryset.filter(driver__user=user)
        else:
            return queryset.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get transaction summary for a date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        company_id = request.query_params.get('company')

        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.queryset.filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )

        if company_id:
            queryset = queryset.filter(company_id=company_id)

        # Calculate summary
        income_total = queryset.filter(transaction_type='income').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        expense_total = queryset.filter(transaction_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        summary_data = {
            'total_income': income_total,
            'total_expense': expense_total,
            'net_profit': income_total - expense_total,
            'transaction_count': queryset.count(),
            'period_start': start_date,
            'period_end': end_date
        }

        serializer = TransactionSummarySerializer(summary_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def category_breakdown(self, request):
        """Get transaction breakdown by category"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        transaction_type = request.query_params.get('transaction_type')

        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.queryset.filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )

        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        # Group by category
        category_data = queryset.values(
            'category__name', 'category__category_type'
        ).annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('-total_amount')

        breakdown = []
        for item in category_data:
            breakdown.append({
                'category_name': item['category__name'],
                'category_type': item['category__category_type'],
                'total_amount': item['total_amount'],
                'transaction_count': item['transaction_count']
            })

        serializer = CategorySummarySerializer(breakdown, many=True)
        return Response(serializer.data)

# Assuming this would be in your hr/views.py file, below TransactionViewSet

class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated] # Adjust permissions as needed
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'transaction__category', 'transaction__payment_method',
        'transaction__bank_account', 'transaction__company', 'transaction__driver',
        'income_source', 'is_recurring', 'transaction__status',
        'due_date', 'next_due_date'
    ]
    search_fields = [
        'income_source', 'invoice_number', 'transaction__description',
        'transaction__transaction_id', 'transaction__company__company_name',
        'transaction__driver__driver_name'
    ]
    ordering_fields = [
        'transaction__amount', 'transaction__transaction_date',
        'due_date', 'next_due_date', 'created_at'
    ]
    ordering = ['-transaction__transaction_date', '-created_at']

    def get_permissions(self):
        # Example permissions: Only accountants can create/update/delete income
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAccountantUser] # Or IsAdminUser
        else:
            # Other roles like management, HR, or even drivers might view
            permission_classes = [IsAuthenticated] # Use specific permission if needed
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Filter queryset based on user role and permissions.
        For example, drivers might only see incomes related to them.
        """
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == 'admin' or user.role == 'accountant':
            return queryset
        elif user.role in ['hr', 'management']:
            # Maybe they can see all incomes, or filtered by company they manage
            return queryset
        elif user.role == 'driver':
            # Drivers can only see income where they are the associated driver
            return queryset.filter(transaction__driver__user=user)
        return queryset.none() # Default to no access if role isn't recognized

    def perform_create(self, serializer):
        # Automatically set the creator for auditing purposes
        serializer.save(created_by=self.request.user)
class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('transaction').all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAccountantUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'expense_type', 'is_recurring', 'recurring_frequency', 'requires_approval',
        'approval_status', 'transaction__status', 'transaction__company', 'transaction__driver'
    ]
    search_fields = ['transaction__description', 'vendor_name', 'bill_number']
    ordering_fields = ['transaction__transaction_date', 'transaction__amount', 'due_date']
    ordering = ['-transaction__transaction_date']

    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            # Allow management to approve/reject expenses
            permission_classes = [IsAuthenticated]  # Will check in the action method
        else:
            permission_classes = [IsAccountantUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == 'admin':
            return queryset
        elif user.role in ['accountant', 'hr', 'management']:
            return queryset
        elif user.role == 'driver':
            return queryset.filter(transaction__driver__user=user)
        else:
            return queryset.none()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an expense"""
        # Check if user can approve expenses
        if not request.user.role in ['admin', 'accountant', 'management']:
            return Response(
                {'error': 'You do not have permission to approve expenses'},
                status=status.HTTP_403_FORBIDDEN
            )

        expense = self.get_object()

        if expense.approval_status != 'pending':
            return Response(
                {'error': 'Expense is not pending approval'},
                status=status.HTTP_400_BAD_REQUEST
            )

        expense.approval_status = 'approved'
        expense.approved_at = timezone.now()
        expense.transaction.approved_by = request.user
        expense.transaction.status = 'completed'
        expense.transaction.save()
        expense.save()

        return Response({'message': 'Expense approved successfully'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject an expense"""
        # Check if user can approve/reject expenses
        if not request.user.role in ['admin', 'accountant', 'management']:
            return Response(
                {'error': 'You do not have permission to reject expenses'},
                status=status.HTTP_403_FORBIDDEN
            )

        expense = self.get_object()

        if expense.approval_status != 'pending':
            return Response(
                {'error': 'Expense is not pending approval'},
                status=status.HTTP_400_BAD_REQUEST
            )

        expense.approval_status = 'rejected'
        expense.transaction.status = 'cancelled'
        expense.transaction.save()
        expense.save()

        return Response({'message': 'Expense rejected successfully'})


class DriverPayrollViewSet(viewsets.ModelViewSet):
    queryset = DriverPayroll.objects.all()
    serializer_class = DriverPayrollSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['driver', 'company', 'status']
    search_fields = ['driver__driver_name', 'company__company_name']
    ordering_fields = ['pay_date', 'pay_period_start', 'net_salary']
    ordering = ['-pay_date']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'process_payment']:
            permission_classes = [IsHRUser]  # HR can manage payroll
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == 'admin':
            return queryset
        elif user.role in ['hr', 'accountant', 'management']:
            return queryset
        elif user.role == 'driver':
            # Drivers can only see their own payroll
            return queryset.filter(driver__user=user)
        else:
            return queryset.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """Process payroll payment and create transaction"""
        payroll = self.get_object()

        if payroll.status != 'processed':
            return Response(
                {'error': 'Payroll must be in processed status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create expense transaction for payroll
        from .models import Transaction, AccountingCategory, PaymentMethod

        try:
            salary_category = AccountingCategory.objects.get(
                name='Driver Salary', category_type='expense'
            )
            payment_method = PaymentMethod.objects.get(name='Bank Transfer')

            transaction = Transaction.objects.create(
                transaction_type='expense',
                amount=payroll.net_salary,
                description=f"Salary payment for {payroll.driver.driver_name} ({payroll.pay_period_start} - {payroll.pay_period_end})",
                category=salary_category,
                payment_method=payment_method,
                company=payroll.company,
                driver=payroll.driver,
                created_by=request.user if hasattr(request, 'user') and request.user.is_authenticated else None,
                status='completed'
            )

            payroll.transaction = transaction
            payroll.status = 'paid'
            payroll.save()

            return Response({'message': 'Payroll payment processed successfully'})

        except (AccountingCategory.DoesNotExist, PaymentMethod.DoesNotExist) as e:
            return Response(
                {'error': f'Required accounting setup missing: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get payroll summary by driver"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.queryset.filter(
            pay_period_start__gte=start_date,
            pay_period_end__lte=end_date
        )

        # Group by driver
        driver_summary = queryset.values('driver__driver_name').annotate(
            total_gross_salary=Sum('gross_salary'),
            total_deductions=Sum('total_deductions'),
            total_net_salary=Sum('net_salary'),
            payroll_count=Count('id')
        ).order_by('-total_net_salary')

        summary = []
        for item in driver_summary:
            summary.append({
                'driver_name': item['driver__driver_name'],
                'total_gross_salary': item['total_gross_salary'],
                'total_deductions': item['total_deductions'],
                'total_net_salary': item['total_net_salary'],
                'payroll_count': item['payroll_count']
            })

        serializer = DriverPayrollSummarySerializer(summary, many=True)
        return Response(serializer.data)


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [AllowAny]  # Changed to AllowAny for testing
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'company', 'category']
    search_fields = ['name', 'description']
    ordering_fields = ['budget_period_start', 'total_budget', 'created_at']
    ordering = ['-budget_period_start']

    def perform_create(self, serializer):
        created_by = None
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            created_by = self.request.user
        serializer.save(created_by=created_by)

    @action(detail=True, methods=['post'])
    def calculate_actuals(self, request, pk=None):
        """Calculate actual income and expenses for the budget"""
        budget = self.get_object()
        budget.calculate_actuals()

        serializer = self.get_serializer(budget)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def variance_report(self, request):
        """Get budget variance report"""
        company_id = request.query_params.get('company')
        status_filter = request.query_params.get('status', 'active')

        queryset = self.queryset.filter(status=status_filter)
        if company_id:
            queryset = queryset.filter(company_id=company_id)

        # Calculate variance for each budget
        for budget in queryset:
            budget.calculate_actuals()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FinancialReportViewSet(viewsets.ModelViewSet):
    queryset = FinancialReport.objects.all()
    serializer_class = FinancialReportSerializer
    permission_classes = [AllowAny]  # Changed to AllowAny for testing
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['report_type', 'company', 'driver', 'category']
    search_fields = ['title', 'description']
    ordering_fields = ['generated_at', 'period_start']
    ordering = ['-generated_at']

    def perform_create(self, serializer):
        generated_by = None
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            generated_by = self.request.user
        serializer.save(generated_by=generated_by)

    @action(detail=False, methods=['post'])
    def generate_income_statement(self, request):
        """Generate income statement report"""
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        company_id = request.data.get('company')

        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate report data
        transactions = Transaction.objects.filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )

        if company_id:
            transactions = transactions.filter(company_id=company_id)

        # Calculate income by category
        income_data = transactions.filter(transaction_type='income').values(
            'category__name'
        ).annotate(
            total=Sum('amount')
        ).order_by('-total')

        # Calculate expenses by category
        expense_data = transactions.filter(transaction_type='expense').values(
            'category__name'
        ).annotate(
            total=Sum('amount')
        ).order_by('-total')

        total_income = sum(item['total'] for item in income_data)
        total_expense = sum(item['total'] for item in expense_data)
        net_profit = total_income - total_expense

        report_data = {
            'income_categories': list(income_data),
            'expense_categories': list(expense_data),
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'net_profit': float(net_profit),
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat()
        }

        # Create report record
        company_name = ""
        if company_id:
            from company.models import Company
            try:
                company = Company.objects.get(id=company_id)
                company_name = f" - {company.company_name}"
            except Company.DoesNotExist:
                pass

        report = FinancialReport.objects.create(
            report_type='income_statement',
            title=f'Income Statement{company_name} ({start_date} - {end_date})',
            period_start=start_date,
            period_end=end_date,
            company_id=company_id if company_id else None,
            report_data=report_data,
            generated_by=request.user if hasattr(request, 'user') and request.user.is_authenticated else None
        )

        serializer = self.get_serializer(report)
        return Response(serializer.data)


class RecurringTransactionViewSet(viewsets.ModelViewSet):
    queryset = RecurringTransaction.objects.all()
    serializer_class = RecurringTransactionSerializer
    permission_classes = [AllowAny]  # Changed to AllowAny for testing
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'transaction_type', 'frequency', 'is_active', 'category',
        'company', 'driver'
    ]
    search_fields = ['name', 'description']
    ordering_fields = ['next_execution_date', 'created_at']
    ordering = ['next_execution_date']

    def perform_create(self, serializer):
        created_by = None
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            created_by = self.request.user
        serializer.save(created_by=created_by)

    @action(detail=True, methods=['post'])
    def execute_now(self, request, pk=None):
        """Execute recurring transaction immediately"""
        recurring_transaction = self.get_object()

        if not recurring_transaction.is_active:
            return Response(
                {'error': 'Recurring transaction is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            transaction = recurring_transaction.create_transaction()
            return Response({
                'message': 'Transaction created successfully',
                'transaction_id': transaction.transaction_id
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to create transaction: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def due_today(self, request):
        """Get recurring transactions due today"""
        today = timezone.now().date()
        due_transactions = self.queryset.filter(
            next_execution_date__lte=today,
            is_active=True
        )

        serializer = self.get_serializer(due_transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def execute_due(self, request):
        """Execute all recurring transactions that are due"""
        today = timezone.now().date()
        due_transactions = self.queryset.filter(
            next_execution_date__lte=today,
            is_active=True
        )

        executed_count = 0
        errors = []

        for recurring_transaction in due_transactions:
            try:
                recurring_transaction.create_transaction()
                executed_count += 1
            except Exception as e:
                errors.append({
                    'transaction_id': recurring_transaction.id,
                    'error': str(e)
                })

        return Response({
            'executed_count': executed_count,
            'errors': errors
        })

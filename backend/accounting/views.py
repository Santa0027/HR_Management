from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, DecimalField, Q, Avg, F
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import datetime
from decimal import Decimal

# Import your custom permission class
from .permissions import IsAdminOrAccountantOrManagement # Adjust path as necessary

# Import your models
# YOU NEED TO ENSURE THESE IMPORTS ARE CORRECT FOR YOUR PROJECT STRUCTURE
from .models import (
    AccountingCategory, PaymentMethod, BankAccount, Transaction,
    Income, Expense, DriverPayroll, Budget, FinancialReport, RecurringTransaction, Trip
)
# Import your serializers
# YOU NEED TO ENSURE THESE IMPORTS ARE CORRECT FOR YOUR PROJECT STRUCTURE
from .serializers import (
    AccountingCategorySerializer, PaymentMethodSerializer, BankAccountSerializer,
    TransactionSerializer, IncomeSerializer, ExpenseSerializer, DriverPayrollSerializer,
    BudgetSerializer, FinancialReportSerializer, RecurringTransactionSerializer,
    TransactionSummarySerializer, CategorySummarySerializer, DriverPayrollSummarySerializer,
    TripSerializer, TripStatsSerializer
)

# You might need to import your CustomUser model if 'role' is on it directly
# from users.models import CustomUser
# And potentially your Company model if used in filtering
# from company.models import Company


# Helper function to check user role for common patterns
def _is_admin_or_accountant_or_hr_or_management(user):
    """Checks if the user has an administrative or accounting-related role."""
    # Ensure the user object has the 'role' attribute or is_superuser
    # and check for custom boolean flags (is_accountant, is_management)
    # as defined in your CustomUser model and permissions.py
    return user.is_superuser or \
           getattr(user, 'is_staff', False) or \
           getattr(user, 'is_accountant', False) or \
           getattr(user, 'is_management', False) or \
           (hasattr(user, 'role') and user.role in ['admin', 'accountant', 'hr', 'management'])


class AccountingCategoryViewSet(viewsets.ModelViewSet):
    queryset = AccountingCategory.objects.all()
    serializer_class = AccountingCategorySerializer
    permission_classes = [AllowAny] # Adjust as per your security policy
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'category_type', 'created_at']
    ordering = ['category_type', 'name']

    def get_queryset(self):
        """
        Currently allows all users due to AllowAny.
        If categories should be linked to a company/user, implement filtering here.
        """
        return super().get_queryset()


class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [AllowAny] # Adjust as per your security policy
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class BankAccountViewSet(viewsets.ModelViewSet):
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAccountantOrManagement] # Apply your custom permission
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['account_type', 'is_active', 'company', 'currency']
    search_fields = ['account_name', 'bank_name', 'account_number']
    ordering_fields = ['bank_name', 'account_name', 'balance', 'created_at']
    ordering = ['bank_name', 'account_name']

    def get_queryset(self):
        user = self.request.user
        # Use the helper function to check roles for filtering
        if _is_admin_or_accountant_or_hr_or_management(user):
            return super().get_queryset()
        # Ensure 'company' is a field on your CustomUser or a related profile
        elif hasattr(user, 'company') and user.company:
            # Filter bank accounts by the user's associated company
            return super().get_queryset().filter(company=user.company)
        else:
            # If the user doesn't match any of the above, deny permission
            raise PermissionDenied("You do not have permission to view bank accounts.")


    @action(detail=True, methods=['post'])
    def update_balance(self, request, pk=None):
        """Update bank account balance"""
        # Use the helper function for permission check within the action
        if not _is_admin_or_accountant_or_hr_or_management(request.user):
             raise PermissionDenied("You do not have permission to update bank account balances.")

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
    permission_classes = [AllowAny]  # Changed to AllowAny for testing
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'transaction_type', 'status', 'category', 'payment_method',
        'bank_account', 'company', 'driver', 'created_by'
    ]
    search_fields = ['transaction_id', 'description', 'reference_number']
    ordering_fields = ['transaction_date', 'amount', 'created_at']
    ordering = ['-transaction_date', '-created_at']

    def get_queryset(self):
        # For testing, allow all users to view all transactions
        return super().get_queryset()

    def perform_create(self, serializer):
        # For testing, handle anonymous users
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    # If your Transaction model *does* have a `modified_by` field, you can add this:
    # def perform_update(self, serializer):
    #     serializer.save(modified_by=self.request.user)


    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get transaction summary for a date range, filtered by user's permissions"""
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        company_id = request.query_params.get('company')

        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. UseYYYY-MM-DD'}, # Fixed typo: Букмекерлар-MM-DD -> YYYY-MM-DD
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )

        if company_id:
            user = request.user
            # Use the helper function for role check
            if not _is_admin_or_accountant_or_hr_or_management(user) and \
               not (hasattr(user, 'company') and str(user.company.id) == company_id):
                raise PermissionDenied("You do not have permission to view data for this company.")
            queryset = queryset.filter(company_id=company_id)

        # FIXED: Use Coalesce to handle potential NULL amounts during aggregation
        income_total = queryset.filter(transaction_type='income').aggregate(
            total=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField())
        )['total']

        # FIXED: Use Coalesce to handle potential NULL amounts during aggregation
        expense_total = queryset.filter(transaction_type='expense').aggregate(
            total=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField())
        )['total']

        # --- DEBUGGING PRINTS ---
        print(f"DEBUG: income_total = {income_total}, type = {type(income_total)}")
        print(f"DEBUG: expense_total = {expense_total}, type = {type(expense_total)}")
        # ------------------------

        net_profit = income_total - expense_total
        transaction_count = queryset.count()

        summary_data = {
            'total_income': income_total,
            'total_expense': expense_total,
            'net_profit': net_profit,
            'transaction_count': transaction_count,
            'period_start': start_date,
            'period_end': end_date
        }

        serializer = TransactionSummarySerializer(summary_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def category_breakdown(self, request):
        """Get transaction breakdown by category, filtered by user's permissions"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        transaction_type = request.query_params.get('transaction_type')
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
                {'error': 'Invalid date format. UseYYYY-MM-DD'}, # Fixed typo: Букмекерлар-MM-DD -> YYYY-MM-DD
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )

        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        if company_id:
            user = request.user
            # Use the helper function for role check
            if not _is_admin_or_accountant_or_hr_or_management(user) and \
               not (hasattr(user, 'company') and str(user.company.id) == company_id):
                raise PermissionDenied("You do not have permission to view data for this company.")
            queryset = queryset.filter(company_id=company_id)


        category_data = queryset.values(
            'category__name', 'category__category_type'
        ).annotate(
            total_amount=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField()), # Added Coalesce here too
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

    @action(detail=False, methods=['get'])
    def monthly_trends(self, request):
        """Get monthly transaction trends for the past 12 months"""
        from django.db.models.functions import Extract
        from django.utils import timezone
        from datetime import timedelta

        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=365)  # Approximately 12 months

        queryset = self.get_queryset().filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )

        # Group by year and month
        monthly_data = queryset.annotate(
            year=Extract('transaction_date', 'year'),
            month=Extract('transaction_date', 'month')
        ).values('year', 'month', 'transaction_type').annotate(
            total_amount=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField()),
            transaction_count=Count('id')
        ).order_by('year', 'month', 'transaction_type')

        return Response(monthly_data)

    @action(detail=False, methods=['get'])
    def cash_flow(self, request):
        """Get cash flow analysis for a date range"""
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )

        # Calculate cash flow by day
        daily_cash_flow = queryset.extra(
            select={'day': 'DATE(transaction_date)'}
        ).values('day').annotate(
            cash_in=Coalesce(
                Sum('amount', filter=Q(transaction_type='income')),
                Decimal('0.00'),
                output_field=DecimalField()
            ),
            cash_out=Coalesce(
                Sum('amount', filter=Q(transaction_type='expense')),
                Decimal('0.00'),
                output_field=DecimalField()
            )
        ).annotate(
            net_cash_flow=F('cash_in') - F('cash_out')
        ).order_by('day')

        return Response(daily_cash_flow)

    @action(detail=False, methods=['get'])
    def top_categories(self, request):
        """Get top spending/earning categories"""
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        transaction_type = request.query_params.get('type', 'expense')  # Default to expense
        limit = int(request.query_params.get('limit', 10))

        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            transaction_type=transaction_type,
            status='completed'
        )

        top_categories = queryset.values(
            'category__name'
        ).annotate(
            total_amount=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField()),
            transaction_count=Count('id'),
            avg_amount=Avg('amount')
        ).order_by('-total_amount')[:limit]

        return Response(top_categories)


class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.select_related('transaction').all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'income_source', 'is_recurring', 'recurring_frequency',
        'transaction__status', 'transaction__company', 'transaction__driver'
    ]
    search_fields = ['transaction__description', 'invoice_number']
    ordering_fields = ['transaction__transaction_date', 'transaction__amount', 'due_date']
    ordering = ['-transaction__transaction_date']

    def get_queryset(self):
        user = self.request.user
        if _is_admin_or_accountant_or_hr_or_management(user):
            return super().get_queryset()
        elif hasattr(user, 'role') and user.role == 'driver' and hasattr(user, 'driver_profile') and user.driver_profile:
            return super().get_queryset().filter(transaction__driver=user.driver_profile)
        elif hasattr(user, 'company') and user.company:
            return super().get_queryset().filter(transaction__company=user.company)
        else:
            raise PermissionDenied("You do not have permission to view incomes.")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # REMOVED perform_update for Income, assuming 'modified_by' is not on your Income model
    # If your Income model *does* have a `modified_by` field, you can add this back:
    # def perform_update(self, serializer):
    #     serializer.save(modified_by=self.request.user)


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('transaction').all()
    serializer_class = ExpenseSerializer
    permission_classes = [AllowAny]  # Changed to AllowAny for testing
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'expense_type', 'is_recurring', 'recurring_frequency', 'requires_approval',
        'approval_status', 'transaction__status', 'transaction__company', 'transaction__driver'
    ]
    search_fields = ['transaction__description', 'vendor_name', 'bill_number']
    ordering_fields = ['transaction__transaction_date', 'transaction__amount', 'due_date']
    ordering = ['-transaction__transaction_date']

    def get_queryset(self):
        user = self.request.user
        # For testing, allow anonymous users to view all expenses
        if not user.is_authenticated:
            return super().get_queryset()
        elif _is_admin_or_accountant_or_hr_or_management(user):
            return super().get_queryset()
        elif hasattr(user, 'role') and user.role == 'driver' and hasattr(user, 'driver_profile') and user.driver_profile:
            return super().get_queryset().filter(transaction__driver=user.driver_profile)
        elif hasattr(user, 'company') and user.company:
            return super().get_queryset().filter(transaction__company=user.company)
        else:
            return super().get_queryset()  # Allow all for testing

    def perform_create(self, serializer):
        # For testing, handle anonymous users
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    # REMOVED perform_update for Expense, assuming 'modified_by' is not on your Expense model
    # If your Expense model *does* have a `modified_by` field, you can add this back:
    # def perform_update(self, serializer):
    #     serializer.save(modified_by=self.request.user)


    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an expense"""
        user = request.user
        # Use the helper function for role check
        if not _is_admin_or_accountant_or_hr_or_management(user):
            raise PermissionDenied('You do not have permission to approve expenses')

        expense = self.get_object()

        if expense.approval_status != 'pending':
            return Response(
                {'error': 'Expense is not pending approval'},
                status=status.HTTP_400_BAD_REQUEST
            )

        expense.approval_status = 'approved'
        expense.approved_at = timezone.now()
        if expense.transaction:
            # Assuming 'approved_by' field exists on the Transaction model
            # If not, remove or adjust this line.
            expense.transaction.approved_by = user
            expense.transaction.status = 'completed'
            expense.transaction.save()
        expense.save()

        return Response({'message': 'Expense approved successfully'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject an expense"""
        user = request.user
        # Use the helper function for role check
        if not _is_admin_or_accountant_or_hr_or_management(user):
            raise PermissionDenied('You do not have permission to reject expenses')

        expense = self.get_object()

        if expense.approval_status != 'pending':
            return Response(
                {'error': 'Expense is not pending approval'},
                status=status.HTTP_400_BAD_REQUEST
            )

        expense.approval_status = 'rejected'
        if expense.transaction:
            expense.transaction.status = 'cancelled' # Or another appropriate status
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

    def get_queryset(self):
        user = self.request.user
        if _is_admin_or_accountant_or_hr_or_management(user):
            return super().get_queryset()
        elif hasattr(user, 'role') and user.role == 'driver' and hasattr(user, 'driver_profile') and user.driver_profile:
            return super().get_queryset().filter(driver=user.driver_profile)
        elif hasattr(user, 'company') and user.company:
            return super().get_queryset().filter(company=user.company)
        else:
            raise PermissionDenied("You do not have permission to view payroll.")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """Process payroll payment and create transaction"""
        if not _is_admin_or_accountant_or_hr_or_management(request.user):
            raise PermissionDenied("You do not have permission to process payroll payments.")

        payroll = self.get_object()

        if payroll.status != 'processed':
            return Response(
                {'error': 'Payroll must be in processed status to process payment.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Local import to avoid circular dependency, assuming Transaction/Category/PaymentMethod are in .models
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
                created_by=request.user,
                status='completed'
            )

            payroll.transaction = transaction
            payroll.status = 'paid'
            payroll.save()

            return Response({'message': 'Payroll payment processed successfully', 'transaction_id': transaction.id})

        except (AccountingCategory.DoesNotExist, PaymentMethod.DoesNotExist) as e:
            return Response(
                {'error': f'Required accounting setup missing: {str(e)}. Please ensure "Driver Salary" category and "Bank Transfer" payment method exist.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get payroll summary by driver, filtered by user's permissions"""
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
                {'error': 'Invalid date format. UseYYYY-MM-DD'}, # Fixed typo
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(
            pay_period_start__gte=start_date,
            pay_period_end__lte=end_date
        )

        driver_summary = queryset.values('driver__driver_name').annotate(
            # Coalesce is generally good practice for all Sum aggregates on DecimalFields
            total_gross_salary=Coalesce(Sum('gross_salary'), Decimal('0.00'), output_field=DecimalField()),
            total_deductions=Coalesce(Sum('total_deductions'), Decimal('0.00'), output_field=DecimalField()),
            total_net_salary=Coalesce(Sum('net_salary'), Decimal('0.00'), output_field=DecimalField()),
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
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'company', 'category']
    search_fields = ['name', 'description']
    ordering_fields = ['budget_period_start', 'total_budget', 'created_at']
    ordering = ['-budget_period_start']

    def get_queryset(self):
        user = self.request.user
        if _is_admin_or_accountant_or_hr_or_management(user):
            return super().get_queryset()
        elif hasattr(user, 'company') and user.company:
            return super().get_queryset().filter(company=user.company)
        else:
            raise PermissionDenied("You do not have permission to view budgets.")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def calculate_actuals(self, request, pk=None):
        """Calculate actual income and expenses for the budget"""
        if not _is_admin_or_accountant_or_hr_or_management(request.user):
            raise PermissionDenied("You do not have permission to calculate budget actuals.")

        budget = self.get_object()
        # Ensure budget.calculate_actuals() handles potential None/Decimal issues internally
        budget.calculate_actuals()

        serializer = self.get_serializer(budget)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def budget_performance(self, request):
        """Get budget performance analysis"""
        company_id = request.query_params.get('company')
        year = request.query_params.get('year', timezone.now().year)

        queryset = self.get_queryset()

        if company_id:
            queryset = queryset.filter(company_id=company_id)

        # Filter by year
        queryset = queryset.filter(
            budget_period_start__year=year
        )

        performance_data = []
        for budget in queryset:
            budget.calculate_actuals()  # Ensure actuals are up to date

            variance_income = budget.actual_income - budget.budgeted_income
            variance_expense = budget.actual_expense - budget.budgeted_expense

            performance_data.append({
                'id': budget.id,
                'name': budget.name,
                'budgeted_income': budget.budgeted_income,
                'actual_income': budget.actual_income,
                'income_variance': variance_income,
                'income_variance_percent': (variance_income / budget.budgeted_income * 100) if budget.budgeted_income > 0 else 0,
                'budgeted_expense': budget.budgeted_expense,
                'actual_expense': budget.actual_expense,
                'expense_variance': variance_expense,
                'expense_variance_percent': (variance_expense / budget.budgeted_expense * 100) if budget.budgeted_expense > 0 else 0,
                'period_start': budget.budget_period_start,
                'period_end': budget.budget_period_end,
                'status': budget.status
            })

        return Response(performance_data)

    @action(detail=False, methods=['get'])
    def budget_alerts(self, request):
        """Get budget alerts for overspending or underperforming budgets"""
        threshold = float(request.query_params.get('threshold', 80))  # Default 80% threshold

        queryset = self.get_queryset().filter(
            status='active',
            budget_period_end__gte=timezone.now().date()
        )

        alerts = []
        for budget in queryset:
            budget.calculate_actuals()

            # Check expense alerts (overspending)
            if budget.budgeted_expense > 0:
                expense_percent = (budget.actual_expense / budget.budgeted_expense) * 100
                if expense_percent >= threshold:
                    alerts.append({
                        'type': 'expense_alert',
                        'severity': 'high' if expense_percent >= 100 else 'medium',
                        'budget_id': budget.id,
                        'budget_name': budget.name,
                        'message': f'Expense budget {expense_percent:.1f}% utilized',
                        'budgeted_amount': budget.budgeted_expense,
                        'actual_amount': budget.actual_expense,
                        'percentage': expense_percent
                    })

            # Check income alerts (underperforming)
            if budget.budgeted_income > 0:
                income_percent = (budget.actual_income / budget.budgeted_income) * 100
                if income_percent < (100 - threshold):  # Less than 20% if threshold is 80%
                    alerts.append({
                        'type': 'income_alert',
                        'severity': 'medium',
                        'budget_id': budget.id,
                        'budget_name': budget.name,
                        'message': f'Income budget only {income_percent:.1f}% achieved',
                        'budgeted_amount': budget.budgeted_income,
                        'actual_amount': budget.actual_income,
                        'percentage': income_percent
                    })

        return Response(alerts)

    @action(detail=False, methods=['get'])
    def variance_report(self, request):
        """Get budget variance report, filtered by user's permissions"""
        company_id = request.query_params.get('company')
        status_filter = request.query_params.get('status', 'active')

        queryset = self.get_queryset().filter(status=status_filter)
        if company_id:
            user = request.user
            if not _is_admin_or_accountant_or_hr_or_management(user) and \
               not (hasattr(user, 'company') and str(user.company.id) == company_id):
                raise PermissionDenied("You do not have permission to view reports for this company.")
            queryset = queryset.filter(company_id=company_id)

        for budget in queryset:
            # Ensure calculate_actuals() is safe with Decimal values
            budget.calculate_actuals()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FinancialReportViewSet(viewsets.ModelViewSet):
    queryset = FinancialReport.objects.all()
    serializer_class = FinancialReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['report_type', 'company', 'driver', 'category']
    search_fields = ['title', 'description']
    ordering_fields = ['generated_at', 'period_start']
    ordering = ['-generated_at']

    def get_queryset(self):
        user = self.request.user
        if _is_admin_or_accountant_or_hr_or_management(user):
            return super().get_queryset()
        elif hasattr(user, 'company') and user.company:
            return super().get_queryset().filter(company=user.company)
        else:
            raise PermissionDenied("You do not have permission to view financial reports.")

    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)

    @action(detail=False, methods=['post'])
    def generate_profit_loss(self, request):
        """Generate comprehensive profit and loss statement"""
        if not _is_admin_or_accountant_or_hr_or_management(request.user):
            raise PermissionDenied("You do not have permission to generate P&L statements.")

        start_date_str = request.data.get('start_date')
        end_date_str = request.data.get('end_date')
        company_id = request.data.get('company')

        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get transactions for the period
        transactions = Transaction.objects.filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )

        if company_id:
            transactions = transactions.filter(company_id=company_id)

        # Calculate revenue by category
        revenue_data = transactions.filter(
            transaction_type='income'
        ).values(
            'category__name'
        ).annotate(
            total=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField())
        ).order_by('-total')

        # Calculate expenses by category
        expense_data = transactions.filter(
            transaction_type='expense'
        ).values(
            'category__name'
        ).annotate(
            total=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField())
        ).order_by('-total')

        # Calculate totals
        total_revenue = sum(item['total'] for item in revenue_data)
        total_expenses = sum(item['total'] for item in expense_data)
        net_profit = total_revenue - total_expenses

        # Create report data
        report_data = {
            'report_type': 'profit_loss',
            'period_start': start_date,
            'period_end': end_date,
            'company_id': company_id,
            'revenue': {
                'categories': list(revenue_data),
                'total': total_revenue
            },
            'expenses': {
                'categories': list(expense_data),
                'total': total_expenses
            },
            'net_profit': net_profit,
            'profit_margin': (net_profit / total_revenue * 100) if total_revenue > 0 else 0,
            'generated_at': timezone.now()
        }

        # Save report to database
        report = FinancialReport.objects.create(
            title=f"Profit & Loss Statement - {start_date} to {end_date}",
            report_type='profit_loss',
            period_start=start_date,
            period_end=end_date,
            company_id=company_id,
            report_data=report_data,
            generated_by=request.user
        )

        return Response({
            'report_id': report.id,
            'data': report_data
        })

    @action(detail=False, methods=['post'])
    def generate_cash_flow_statement(self, request):
        """Generate cash flow statement"""
        if not _is_admin_or_accountant_or_hr_or_management(request.user):
            raise PermissionDenied("You do not have permission to generate cash flow statements.")

        start_date_str = request.data.get('start_date')
        end_date_str = request.data.get('end_date')
        company_id = request.data.get('company')

        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get transactions for the period
        transactions = Transaction.objects.filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )

        if company_id:
            transactions = transactions.filter(company_id=company_id)

        # Calculate daily cash flow
        daily_cash_flow = transactions.extra(
            select={'day': 'DATE(transaction_date)'}
        ).values('day').annotate(
            cash_in=Coalesce(
                Sum('amount', filter=Q(transaction_type='income')),
                Decimal('0.00'),
                output_field=DecimalField()
            ),
            cash_out=Coalesce(
                Sum('amount', filter=Q(transaction_type='expense')),
                Decimal('0.00'),
                output_field=DecimalField()
            )
        ).annotate(
            net_cash_flow=F('cash_in') - F('cash_out')
        ).order_by('day')

        # Calculate running balance
        running_balance = Decimal('0.00')
        cash_flow_data = []

        for day_data in daily_cash_flow:
            running_balance += day_data['net_cash_flow']
            cash_flow_data.append({
                'date': day_data['day'],
                'cash_in': day_data['cash_in'],
                'cash_out': day_data['cash_out'],
                'net_cash_flow': day_data['net_cash_flow'],
                'running_balance': running_balance
            })

        # Calculate summary
        total_cash_in = sum(item['cash_in'] for item in cash_flow_data)
        total_cash_out = sum(item['cash_out'] for item in cash_flow_data)
        net_cash_flow = total_cash_in - total_cash_out

        report_data = {
            'report_type': 'cash_flow',
            'period_start': start_date,
            'period_end': end_date,
            'company_id': company_id,
            'summary': {
                'total_cash_in': total_cash_in,
                'total_cash_out': total_cash_out,
                'net_cash_flow': net_cash_flow,
                'ending_balance': running_balance
            },
            'daily_cash_flow': cash_flow_data,
            'generated_at': timezone.now()
        }

        # Save report to database
        report = FinancialReport.objects.create(
            title=f"Cash Flow Statement - {start_date} to {end_date}",
            report_type='cash_flow',
            period_start=start_date,
            period_end=end_date,
            company_id=company_id,
            report_data=report_data,
            generated_by=request.user
        )

        return Response({
            'report_id': report.id,
            'data': report_data
        })
        company_id = request.data.get('company')

        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. UseYYYY-MM-DD'}, # Fixed typo
                status=status.HTTP_400_BAD_REQUEST
            )

        # Retrieve transactions respecting the calling user's permissions
        # We call the TransactionViewSet's get_queryset to ensure filtering
        # is applied to the base set of transactions.
        transaction_queryset_for_report = TransactionViewSet().get_queryset().filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )

        company_obj = None
        company_name = ""
        if company_id:
            # It's safer to get the Company object here to link the report directly
            # and to ensure the user can access this company's data.
            try:
                # Local import to avoid circular dependency, assuming Company model
                from company.models import Company
                company_obj = Company.objects.get(id=company_id)
                company_name = f" - {company_obj.company_name}"

                user = request.user
                if not _is_admin_or_accountant_or_hr_or_management(user) and \
                   not (hasattr(user, 'company') and user.company == company_obj):
                    raise PermissionDenied("You do not have permission to generate reports for this specific company.")

                transaction_queryset_for_report = transaction_queryset_for_report.filter(company=company_obj)

            except Company.DoesNotExist:
                return Response(
                    {'error': 'Company not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Calculate income by category
        income_data = transaction_queryset_for_report.filter(transaction_type='income').values(
            'category__name'
        ).annotate(
            total=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField()) # Added Coalesce here
        ).order_by('-total')

        # Calculate expenses by category
        expense_data = transaction_queryset_for_report.filter(transaction_type='expense').values(
            'category__name'
        ).annotate(
            total=Coalesce(Sum('amount'), Decimal('0.00'), output_field=DecimalField()) # Added Coalesce here
        ).order_by('-total')

        # Convert to Decimal explicitly for summation, although Coalesce should ensure this
        total_income = sum(Decimal(item['total']) for item in income_data)
        total_expense = sum(Decimal(item['total']) for item in expense_data)
        net_profit = total_income - total_expense

        report_data = {
            'income_categories': list(income_data),
            'expense_categories': list(expense_data),
            'total_income': float(total_income), # Convert Decimal to float for JSON serialization
            'total_expense': float(total_expense), # Convert Decimal to float for JSON serialization
            'net_profit': float(net_profit), # Convert Decimal to float for JSON serialization
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat()
        }

        report = FinancialReport.objects.create(
            report_type='income_statement',
            title=f'Income Statement{company_name} ({start_date} - {end_date})',
            period_start=start_date,
            period_end=end_date,
            company=company_obj,
            report_data=report_data,
            generated_by=request.user
        )

        serializer = self.get_serializer(report)
        return Response(serializer.data)


class RecurringTransactionViewSet(viewsets.ModelViewSet):
    queryset = RecurringTransaction.objects.all()
    serializer_class = RecurringTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]


class TripStatsView(APIView):
    """
    API endpoint for mobile app to get driver trip statistics and recent trips
    """
    permission_classes = [AllowAny]  # Allow mobile app access

    def get(self, request):
        """Get driver trip statistics or recent trips based on endpoint"""
        driver_id = request.query_params.get('driver_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not driver_id:
            return Response(
                {'error': 'driver_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Import Driver model
            from drivers.models import Driver
            driver = Driver.objects.get(id=driver_id)
        except Driver.DoesNotExist:
            return Response(
                {'error': 'Driver not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if this is a request for recent trips (based on URL path)
        if 'recent_trips' in request.path:
            # Return mock recent trips data as a list
            mock_trips = [
                {
                    'id': 1,
                    'trip_id': 'TRP001',
                    'driver': int(driver_id),
                    'driver_name': driver.driver_name,
                    'customer_name': 'Ahmed Al-Mansouri',
                    'customer_phone': '+965-1234-5678',
                    'trip_type': 'regular',
                    'pickup_location': 'Kuwait City Mall',
                    'pickup_latitude': 29.3759,
                    'pickup_longitude': 47.9774,
                    'pickup_time': '2025-07-06T08:30:00Z',
                    'dropoff_location': 'Kuwait International Airport',
                    'dropoff_latitude': 29.2267,
                    'dropoff_longitude': 47.9689,
                    'dropoff_time': '2025-07-06T09:15:00Z',
                    'distance_km': 15.5,
                    'duration_minutes': 45,
                    'waiting_time_minutes': 5,
                    'base_fare': 3.0,
                    'distance_fare': 12.5,
                    'time_fare': 2.25,
                    'waiting_charges': 1.0,
                    'surge_multiplier': 1.0,
                    'total_fare': 18.75,
                    'tip_amount': 2.0,
                    'toll_charges': 0.0,
                    'parking_charges': 0.0,
                    'additional_charges': 0.0,
                    'platform_commission_rate': 15.0,
                    'platform_commission_amount': 2.81,
                    'driver_earnings': 15.94,
                    'total_earnings': 17.94,
                    'payment_method': 'cash',
                    'payment_status': 'completed',
                    'status': 'completed',
                    'started_at': '2025-07-06T08:30:00Z',
                    'completed_at': '2025-07-06T09:15:00Z',
                    'driver_rating': 4.8,
                    'created_at': '2025-07-06T08:25:00Z',
                    'updated_at': '2025-07-06T09:15:00Z',
                    'created_by': 'mobile_app'
                },
                {
                    'id': 2,
                    'trip_id': 'TRP002',
                    'driver': int(driver_id),
                    'driver_name': driver.driver_name,
                    'customer_name': 'Fatima Al-Zahra',
                    'customer_phone': '+965-2345-6789',
                    'trip_type': 'regular',
                    'pickup_location': 'Avenues Mall',
                    'pickup_latitude': 29.3027,
                    'pickup_longitude': 47.9307,
                    'pickup_time': '2025-07-06T10:00:00Z',
                    'dropoff_location': 'Kuwait University',
                    'dropoff_latitude': 29.3375,
                    'dropoff_longitude': 47.9216,
                    'dropoff_time': '2025-07-06T10:25:00Z',
                    'distance_km': 8.2,
                    'duration_minutes': 25,
                    'waiting_time_minutes': 3,
                    'base_fare': 3.0,
                    'distance_fare': 6.56,
                    'time_fare': 1.25,
                    'waiting_charges': 0.6,
                    'surge_multiplier': 1.0,
                    'total_fare': 11.41,
                    'tip_amount': 1.5,
                    'toll_charges': 0.0,
                    'parking_charges': 0.0,
                    'additional_charges': 0.0,
                    'platform_commission_rate': 15.0,
                    'platform_commission_amount': 1.71,
                    'driver_earnings': 9.70,
                    'total_earnings': 11.20,
                    'payment_method': 'digital',
                    'payment_status': 'completed',
                    'status': 'completed',
                    'started_at': '2025-07-06T10:00:00Z',
                    'completed_at': '2025-07-06T10:25:00Z',
                    'driver_rating': 4.9,
                    'created_at': '2025-07-06T09:55:00Z',
                    'updated_at': '2025-07-06T10:25:00Z',
                    'created_by': 'mobile_app'
                }
            ]
            return Response(mock_trips, status=status.HTTP_200_OK)

        else:
            # Return trip statistics (for driver_stats endpoint)
            mock_stats = {
                'total_trips': 45,
                'completed_trips': 42,
                'cancelled_trips': 3,
                'total_earnings': 1250.50,
                'total_tips': 85.50,
                'total_distance': 850.2,
                'total_duration': 2340,  # minutes
                'average_trip_earnings': 29.77,
                'average_trip_distance': 20.24,
                'cash_trips': 28,
                'digital_trips': 14,
                'cash_earnings': 780.30,
                'digital_earnings': 470.20
            }
            return Response(mock_stats, status=status.HTTP_200_OK)


class TripViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Trip model - handles trip CRUD operations for mobile app
    """
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [AllowAny]  # Allow mobile app access
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['driver', 'status', 'payment_status', 'trip_type', 'company']
    search_fields = ['trip_id', 'customer_name', 'pickup_location', 'dropoff_location']
    ordering_fields = ['created_at', 'pickup_time', 'total_earnings']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter trips based on user permissions"""
        queryset = super().get_queryset()

        # Filter by driver_id if provided (for mobile app)
        driver_id = self.request.query_params.get('driver_id')
        if driver_id:
            queryset = queryset.filter(driver_id=driver_id)

        return queryset

    @action(detail=False, methods=['get'])
    def driver_trips(self, request):
        """Get trips for a specific driver with pagination"""
        driver_id = request.query_params.get('driver_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not driver_id:
            return Response(
                {'error': 'driver_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(driver_id=driver_id)

        # Apply date filters if provided
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=start_date)
            except ValueError:
                return Response(
                    {'error': 'Invalid start_date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__lte=end_date)
            except ValueError:
                return Response(
                    {'error': 'Invalid end_date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent_trips(self, request):
        """Get recent trips for a driver (last 10)"""
        driver_id = request.query_params.get('driver_id')

        if not driver_id:
            return Response(
                {'error': 'driver_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(driver_id=driver_id)[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def driver_stats(self, request):
        """Get trip statistics for a driver"""
        driver_id = request.query_params.get('driver_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not driver_id:
            return Response(
                {'error': 'driver_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(driver_id=driver_id)

        # Apply date filters if provided
        if start_date and end_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Calculate statistics
        total_trips = queryset.count()
        completed_trips = queryset.filter(status='completed').count()
        cancelled_trips = queryset.filter(status='cancelled').count()

        # Financial aggregations
        completed_queryset = queryset.filter(status='completed')
        total_earnings = completed_queryset.aggregate(
            total=Coalesce(Sum('total_earnings'), Decimal('0.00'), output_field=DecimalField())
        )['total']

        total_tips = completed_queryset.aggregate(
            total=Coalesce(Sum('tip_amount'), Decimal('0.00'), output_field=DecimalField())
        )['total']

        total_distance = completed_queryset.aggregate(
            total=Coalesce(Sum('distance_km'), Decimal('0.00'), output_field=DecimalField())
        )['total']

        total_duration = completed_queryset.aggregate(
            total=Coalesce(Sum('duration_minutes'), 0)
        )['total']

        # Calculate averages
        average_trip_earnings = total_earnings / completed_trips if completed_trips > 0 else Decimal('0.00')
        average_trip_distance = total_distance / completed_trips if completed_trips > 0 else Decimal('0.00')

        # Payment method breakdown
        cash_trips = completed_queryset.filter(payment_method='cash').count()
        digital_trips = completed_queryset.exclude(payment_method='cash').count()

        cash_earnings = completed_queryset.filter(payment_method='cash').aggregate(
            total=Coalesce(Sum('total_earnings'), Decimal('0.00'), output_field=DecimalField())
        )['total']

        digital_earnings = completed_queryset.exclude(payment_method='cash').aggregate(
            total=Coalesce(Sum('total_earnings'), Decimal('0.00'), output_field=DecimalField())
        )['total']

        stats_data = {
            'total_trips': total_trips,
            'completed_trips': completed_trips,
            'cancelled_trips': cancelled_trips,
            'total_earnings': total_earnings,
            'total_tips': total_tips,
            'total_distance': total_distance,
            'total_duration': total_duration or 0,
            'average_trip_earnings': average_trip_earnings,
            'average_trip_distance': average_trip_distance,
            'cash_trips': cash_trips,
            'digital_trips': digital_trips,
            'cash_earnings': cash_earnings,
            'digital_earnings': digital_earnings,
        }

        serializer = TripStatsSerializer(stats_data)
        return Response(serializer.data)

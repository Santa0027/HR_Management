from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccountingCategoryViewSet, PaymentMethodViewSet, BankAccountViewSet,
    TransactionViewSet, IncomeViewSet, ExpenseViewSet, DriverPayrollViewSet,
    BudgetViewSet, FinancialReportViewSet, RecurringTransactionViewSet,
    TripStatsView, TripViewSet
)

router = DefaultRouter()
router.register(r'categories', AccountingCategoryViewSet, basename='accounting-category')
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')
router.register(r'bank-accounts', BankAccountViewSet, basename='bank-account')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'income', IncomeViewSet, basename='income')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'payroll', DriverPayrollViewSet, basename='driver-payroll')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'reports', FinancialReportViewSet, basename='financial-report')
router.register(r'recurring', RecurringTransactionViewSet, basename='recurring-transaction')
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    path('', include(router.urls)),
    # Note: TripViewSet custom actions (driver_stats, recent_trips, driver_trips)
    # are automatically registered by the router, so no need for manual URL patterns
]

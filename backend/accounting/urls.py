from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccountingCategoryViewSet, PaymentMethodViewSet, BankAccountViewSet,
    TransactionViewSet, IncomeViewSet, ExpenseViewSet, DriverPayrollViewSet,
    BudgetViewSet, FinancialReportViewSet, RecurringTransactionViewSet
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

urlpatterns = [
    path('', include(router.urls)),
]

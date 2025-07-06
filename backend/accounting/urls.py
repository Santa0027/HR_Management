from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransactionViewSet,
    IncomeViewSet,
    ExpenseViewSet,
    AccountingDashboardView,
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)
router.register(r'income', IncomeViewSet)
router.register(r'expenses', ExpenseViewSet)

urlpatterns = [
    # API routes
    path('', include(router.urls)),
    
    # Dashboard
    path('dashboard/', AccountingDashboardView.as_view(), name='accounting-dashboard'),
]

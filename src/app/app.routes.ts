import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { VerifyEmail } from './pages/auth/verify-email/verify-email';
import { UserProfile } from './pages/auth/user-profile/user-profile';
import { authGuard, adminGuard } from './core/guards/auth-guard';
import { RecoverPassword } from './pages/auth/recover-password/recover-password';
import { VerifyOtp } from './pages/verify-otp/verify-otp';
import { CreateStation } from './pages/station/create-station/create-station';
import { StationList } from './pages/station/station-list/station-list';
import { NotFound } from './pages/not-found/not-found';
import { Settings } from './pages/admin/settings/settings';
import { StationDistanceAndFare } from './pages/station-distance-and-fare/station-distance-and-fare';
import { PurchaseTicket } from './pages/journey/purchase-ticket/purchase-ticket';
import { PaymentOption } from './pages/payment/payment-option/payment-option';
import { PayFromBalance } from './pages/payment/pay-from-balance/pay-from-balance';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: Home
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'verify-email',
        component: VerifyEmail
    },
    {
        path: 'user-profile',
        component: UserProfile,
        canActivate: [authGuard]
    },
    {
        path: 'recover-password',
        component: RecoverPassword,
    },
    {
        path: 'verify-otp',
        component: VerifyOtp,
    },
    {
        path: 'create-station',
        component: CreateStation,
        canActivate: [adminGuard],
    },
    {
        path: 'stations',
        component: StationList,
    },
    {
        path: 'settings',
        component: Settings,
    },
    {
        path: 'distance&fare',
        component: StationDistanceAndFare,
    },
    {
        path: 'ticket-purchase',
        component: PurchaseTicket,
    },
    {
        path: 'payment-option',
        component: PaymentOption,
    },
    {
        path: 'account-balance-payment',
        component: PayFromBalance,
    },
    {
        path: 'dashboard',
        component: Dashboard,
    },
    {
        path: 'not-found',
        component: NotFound,
    },
    {
        path: '**',
        redirectTo: 'not-found',
    }
];

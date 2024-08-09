import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth.guard';
import { ConnectorListComponent } from './connectors/connector-list/connector-list.component';
import { ConnectorCreateComponent } from './connectors/connector-create/connector-create.component';

const routes: Routes = [
  { path: '', component: ConnectorListComponent, canActivate: [AuthGuard] },
  {
    path: 'create',
    component: ConnectorCreateComponent,
    canActivate: [AuthGuard],
  },
  // {
  //   path: 'edit/:postId',
  //   component: PostCreateComponent,
  //   canActivate: [AuthGuard],
  // },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}

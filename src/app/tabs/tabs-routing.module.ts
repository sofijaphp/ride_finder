import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {TabsPage} from './tabs.page';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'profile',
        loadChildren: () => import('../tabs/profile/profile.module').then(m => m.ProfilePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'book',
        loadChildren: () => import('../tabs/book/book.module').then(m => m.BookPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'my-rides',
        loadChildren: () => import('./my-rides/my-rides.module').then(m => m.MyRidesPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'admin-create-rides',
        loadChildren: () => import('./admin-create-rides/admin-create-rides.module').then(m => m.AdminRidesPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'home',
        loadChildren: () => import('../tabs/home/home.module').then(m => m.HomePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'admin-approve-rides',
        loadChildren: () => import('./admin-approve-rides/admin-approve-rides.module').then(m => m.AdminApproveRidesPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {
}

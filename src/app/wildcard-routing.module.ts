import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const childRoutes: Routes = [
  { path: '**', redirectTo: 'main/collection', pathMatch: 'full' }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(childRoutes)],
  declarations: [],
  exports: [RouterModule]
})
export class WildcardRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './Components/main-page/main-page.component';
import { WelcomeComponent } from './Components/welcome/welcome.component';


const routes: Routes = [
  {path:'', component:WelcomeComponent},
  {path:'main', component:MainPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

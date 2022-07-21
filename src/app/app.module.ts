import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSliderModule } from '@angular/material/slider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MatIconModule} from '@angular/material/icon';
import { DrawingComponent } from './Components/drawing/drawing.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TooltipsComponent } from './Components/tooltips/tooltips.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ConfMatComponent } from './Components/conf-mat/conf-mat.component';
import { MetricsComponent } from './Components/metrics/metrics.component';
import { ClassesService } from './Services/classes.service';
import {MatSidenavModule} from '@angular/material/sidenav';

@NgModule({
  declarations: [
    AppComponent,
    DrawingComponent,
    TooltipsComponent,
    ConfMatComponent,
    MetricsComponent,
  ],
  imports: [
    MatIconModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatSliderModule,
    MatButtonModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [ClassesService],
  bootstrap: [AppComponent]
})
export class AppModule { }

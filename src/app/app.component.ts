import { Component } from '@angular/core';
import { UsersListComponent } from './features/users/components/users-list/users-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [UsersListComponent]
})
export class AppComponent { }


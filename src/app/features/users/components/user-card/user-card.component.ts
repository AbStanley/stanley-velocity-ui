import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  user = input.required<User>();
  expanded = input<boolean>(false);
  toggle = output<void>();

  onToggle() {
    this.toggle.emit();
  }
}

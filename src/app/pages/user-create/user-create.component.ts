import { Component, OnDestroy, inject } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AsyncPipe, NgFor, NgStyle } from '@angular/common';
import { UserService } from '../../service/user.service';
import { User } from '../../interface/user.interface';
import { Subject, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    MatSelectModule,
    RouterOutlet,
    AsyncPipe,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgStyle,
    ReactiveFormsModule,
  ],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss',
})
export class UserCreateComponent implements OnDestroy {
  service = inject(UserService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  subj$ = new Subject();
  years: number[] = [];
  currentYear: number = new Date().getFullYear();

  form = new FormGroup({
    id: new FormControl(''),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    birthDate: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.required, Validators.minLength(8)]),
    address: new FormGroup({
      city: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
    }),
    skills: new FormArray([
      new FormGroup({
        skill: new FormControl('', Validators.required),
      }),
    ]),
    workExperiance: new FormArray([
      new FormGroup({
        workplace: new FormControl('', Validators.required),
        position: new FormControl('', Validators.required),
        startYear: new FormControl('', Validators.required),
        endYear: new FormControl('', Validators.required),
      }),
    ]),
  });
  user$ = this.activatedRoute.params.pipe(
    map((params) => params['id']),
    switchMap((id) => {
      if (id) {
        return this.service.getUser(id).pipe(
          tap((user: any) => {
            this.form.patchValue(user);
          })
        );
      }
      return of();
    })
  );

  selectedPeriod(): string {
    const startYear = this.form.get('startYear')?.value;
    const endYear = this.form.get('endYear')?.value;
    if (startYear && endYear) {
      return `${startYear}-${endYear}`;
    }
    return '';
  }

  constructor() {
    for (let i = this.currentYear; i >= this.currentYear - 100; i--) {
      this.years.push(i);
    }
  }
  get skills() {
    return this.form.get('skills') as FormArray;
  }

  get workExperiance() {
    return this.form.get('workExperiance') as FormArray;
  }

  addSkill() {
    const newControl = new FormGroup({
      skill: new FormControl(''),
    });
    this.skills.push(newControl);
  }

  addexperiance() {
    const newexperiance = new FormGroup({
      workplace: new FormControl('', Validators.required),
      position: new FormControl('', Validators.required),
      startYear: new FormControl('', Validators.required),
      endYear: new FormControl('', Validators.required),
    });
    this.workExperiance.push(newexperiance);
  }
  deleteexperiance(i: number) {
    this.workExperiance.removeAt(i);
  }

  deleteSkill(i: number) {
    this.skills.removeAt(i);
  }

  Submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const {
      id,
      firstName,
      lastName,
      birthDate,
      phone,
      address,
      skills,
      workExperiance,
    } = this.form.value;

    if (id) {
      this.service
        .updateUser({
          id,
          firstName,
          lastName,
          birthDate,
          phone,
          address,
          skills,
          workExperiance,
        } as User)
        .pipe(takeUntil(this.subj$))
        .subscribe(() => {
          this.router.navigate(['/users']);
        });
    } else {
      const randomid = Math.round(Math.random() * 100000);
      const user = {
        id: String(randomid),
        firstName,
        lastName,
        birthDate,
        phone,
        address,
        skills,
        workExperiance,
      } as User;

      this.service
        .createUser(user)
        .pipe(takeUntil(this.subj$))
        .subscribe(() => {
          this.router.navigate(['/users']);
        });
    }
  }
  ngOnDestroy(): void {
    this.subj$.next('null');
    this.subj$.complete();
  }
}

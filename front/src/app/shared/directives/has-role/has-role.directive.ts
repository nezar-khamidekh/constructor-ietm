import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { ParticipantI } from '../../models/participant.interface';

@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective implements OnInit {
  @Input('appHasRole') roles: number[] = [];
  @Input('appHasRoleUserId') userId = '';
  @Input('appHasRoleParticipants') participants: ParticipantI[] = [];

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  ngOnInit(): void {
    const userRole = this.participants.find(
      (participant) => participant.user._id === this.userId,
    )?.role;

    if (typeof userRole !== 'undefined' && this.roles.includes(userRole))
      this.viewContainer.createEmbeddedView(this.templateRef);
    else this.viewContainer.clear();
  }
}

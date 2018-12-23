import { Component, OnInit, Input, SimpleChanges, NgZone } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {
  @Input() progress: any;

  constructor(private zone: NgZone) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    /*if(changes['progress']) {
      this.progress = changes['progress'];
    }*/

    this.zone.run(() => {
      //console.log('UI has refreshed');
    });
  }

}

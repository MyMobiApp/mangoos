import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss']
})
export class MiniPlayerComponent implements OnInit {

  @Input() sColor: string = "dark";

  constructor() { }

  ngOnInit() {
  }

}

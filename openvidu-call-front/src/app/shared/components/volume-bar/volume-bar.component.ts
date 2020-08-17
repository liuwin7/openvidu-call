import { Component, OnInit, Input } from '@angular/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { ThemePalette } from '@angular/material/core';

@Component({
	selector: 'app-volume-bar',
	templateUrl: './volume-bar.component.html',
	styleUrls: ['./volume-bar.component.css']
})
export class VolumeBarComponent implements OnInit {
	@Input() value: number;
	@Input() mode: ProgressBarMode;

	@Input() color: ThemePalette;

	constructor() {}

	ngOnInit(): void {}
}

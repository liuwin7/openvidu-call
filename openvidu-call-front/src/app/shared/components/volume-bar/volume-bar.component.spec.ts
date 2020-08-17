import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeBarComponent } from './volume-bar.component';

describe('VolumeBarComponent', () => {
	let component: VolumeBarComponent;
	let fixture: ComponentFixture<VolumeBarComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VolumeBarComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VolumeBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

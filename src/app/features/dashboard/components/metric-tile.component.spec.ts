import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricTileComponent } from './metric-tile.component';

describe('MetricTileComponent', () => {
  let fixture: ComponentFixture<MetricTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricTileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricTileComponent);
  });

  it('renders label, value, and trend', () => {
    fixture.componentRef.setInput('label', 'Velocity');
    fixture.componentRef.setInput('value', '98%');
    fixture.componentRef.setInput('trend', 'up');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.label')?.textContent).toContain('Velocity');
    expect(element.querySelector('h3')?.textContent).toContain('98%');
    const trend = element.querySelector('.trend');
    expect(trend?.textContent).toContain('up');
    expect(trend?.className).toContain('up');
  });
});

import { describe, expect, it } from 'vitest';
import { cameraFailureMessage } from './camera';

describe('cameraFailureMessage', () => {
  it('translates a missing camera into Dutch', () => {
    const error = new DOMException('Requested device not found', 'NotFoundError');
    expect(cameraFailureMessage(error)).toBe(
      'Geen camera gevonden. Sluit een camera aan en probeer opnieuw.',
    );
  });

  it('translates a denied camera into Dutch', () => {
    const error = new DOMException('Permission denied', 'NotAllowedError');
    expect(cameraFailureMessage(error)).toBe(
      'Camera-toegang geweigerd. Sta de camera toe en probeer opnieuw.',
    );
  });

  it('keeps our own Dutch camera message', () => {
    expect(
      cameraFailureMessage(new Error('Camera wordt niet ondersteund in deze browser.')),
    ).toBe('Camera wordt niet ondersteund in deze browser.');
  });
});
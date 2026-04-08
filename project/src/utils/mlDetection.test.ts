import { describe, it, expect } from 'vitest';
import { mlScanURL, mlScanText, mlScanPhone } from './mlDetection';

describe('mlScanURL', () => {
  it('scores benign HTTPS URLs lower than obvious phishing patterns', () => {
    const safe = mlScanURL('https://www.google.com/search?q=test');
    const sketchy = mlScanURL('http://paypal-verify-scam.xyz/login/secure');
    expect(safe.score).toBeLessThan(sketchy.score);
    expect(sketchy.score).toBeGreaterThanOrEqual(30);
  });

  it('flags HTTP and credential keywords', () => {
    const httpLogin = mlScanURL('http://example.com/login/password-reset');
    expect(httpLogin.score).toBeGreaterThan(10);
  });

  it('returns structured prediction', () => {
    const r = mlScanURL('https://bank.example.com');
    expect(r).toMatchObject({
      confidence: expect.stringMatching(/high|medium|low/),
      modelVersion: expect.stringContaining('Norix'),
    });
    expect(Array.isArray(r.features)).toBe(true);
  });
});

describe('trusted host damping', () => {
  it('keeps google.com scores low despite long path', () => {
    const r = mlScanURL('https://www.google.com/search?q=paypal+login+verify');
    expect(r.score).toBeLessThan(45);
  });
});

describe('mlScanText', () => {
  it('detects urgency and OTP patterns in smishing copy', () => {
    const scam = mlScanText(
      'URGENT: Your SBI account will be suspended. Share your OTP immediately to verify KYC.'
    );
    expect(scam.score).toBeGreaterThan(42);
  });
});

describe('mlScanPhone', () => {
  it('flags classic vishing script patterns', () => {
    const v = mlScanPhone(
      'This is RBI officer. Send your Aadhaar and card CVV immediately or account arrest.'
    );
    expect(v.score).toBeGreaterThan(40);
  });
});

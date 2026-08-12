const DOMPurify = require('../common/dompurify');

describe('DOMPurify (vendored)', () => {
  test('strips <script> tags from untrusted input', () => {
    const dirty = 'hello<script>alert(1)</script>world';
    const clean = DOMPurify.sanitize(dirty);

    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('alert(1)');
  });

  test('strips inline event handlers like onerror', () => {
    const dirty = '<img src=x onerror=alert(1)>';
    const clean = DOMPurify.sanitize(dirty);

    expect(clean).not.toContain('onerror');
  });

  test('preserves benign formatting markup used by popup notifications', () => {
    const safe = '<i class="small material-icons">info</i> model uploaded sucessfully';
    const clean = DOMPurify.sanitize(safe);

    expect(clean).toContain('<i class="small material-icons">info</i>');
    expect(clean).toContain('model uploaded sucessfully');
  });

  test('stringifies non-string input rather than throwing', () => {
    expect(() => DOMPurify.sanitize(42)).not.toThrow();
  });
});

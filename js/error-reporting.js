/**
 * إبلاغ Sentry عن أخطاء مُعالَجة (لا تصل تلقائياً للـ SDK)
 */
const ErrorReporting = {
  capture(action, error, extra = {}) {
    if (!window.Sentry) return;

    const err =
      error instanceof Error
        ? error
        : new Error(String(error?.message || error || 'Unknown error'));

    Sentry.withScope((scope) => {
      scope.setTag('action', action);
      scope.setLevel('error');
      Object.entries(extra).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          scope.setExtra(key, value);
        }
      });
      Sentry.captureException(err);
    });
  },

  captureMessage(message, level = 'warning', extra = {}) {
    if (!window.Sentry) return;

    Sentry.withScope((scope) => {
      if (extra.action) scope.setTag('action', extra.action);
      Object.entries(extra).forEach(([key, value]) => {
        if (key !== 'action' && value !== undefined && value !== null) {
          scope.setExtra(key, value);
        }
      });
      Sentry.captureMessage(message, level);
    });
  },
};

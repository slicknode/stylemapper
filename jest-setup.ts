// In your own jest-setup.js (or any other name)
import '@testing-library/jest-dom';

export {};
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveStyleRule(attr: string, value: string): R;
    }
  }
}

let consoleErrorMock: { mockRestore: () => void };

// React throws deprecation warnings when used without createRoot.
// Supress those errors in test until testing-library supports that by default.
beforeEach(() => {
  const originalConsoleError = console.error;
  consoleErrorMock = jest
    .spyOn(console, 'error')
    .mockImplementation((message, ...optionalParams) => {
      // Ignore ReactDOM.render/ReactDOM.hydrate deprecation warning
      if (message.indexOf('Use createRoot instead.') !== -1) {
        return;
      }
      originalConsoleError(message, ...optionalParams);
    });
});

afterEach(() => {
  consoleErrorMock.mockRestore();
});

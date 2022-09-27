import * as React from 'react';
import { styled } from './styled';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('styled', () => {
  const TestComponent = (props: { open?: boolean; className?: string }) => {
    return (
      <div className={props.className}>{props.open ? 'open' : 'closed'}</div>
    );
  };

  it('adds boolean true variant prop', () => {
    const StyledComponent = styled(TestComponent, {
      variants: {
        test: {
          true: 'open',
        },
      },
    });
    render(<StyledComponent test={true} />);
  });

  it('adds className via configuration', () => {
    const className = 'some-class';
    const StyledComponent = styled(TestComponent, className);
    const { container } = render(<StyledComponent />);
    expect(container.firstChild).toHaveClass(className);
  });

  it('adds className via configuration + prop', () => {
    const className = 'some-class';
    const otherClassName = 'other-class';
    const StyledComponent = styled(TestComponent, className);
    const { container } = render(
      <StyledComponent className={otherClassName} />
    );
    expect(container.firstChild).toHaveClass(className);
    expect(container.firstChild).toHaveClass(otherClassName);
  });

  it('merges wrapped component props with variant props', () => {
    const class1 = 'class1';
    const StyledComponent = styled(TestComponent, {
      variants: {
        test: {
          true: class1,
        },
      },
    });
    const { container } = render(<StyledComponent test={true} open={true} />);
    expect(container.firstChild).toHaveClass(class1);
  });

  it('merges multiple variant configs', () => {
    const class1 = 'class1';
    const class2 = 'class2';
    const StyledComponent = styled(
      TestComponent,
      {
        variants: {
          prop1: {
            value1: class1,
          },
        },
        defaultVariants: {
          prop1: 'value1',
        },
        forwardProps: ['prop1'],
      },
      {
        variants: {
          prop2: {
            value2: class2,
          },
        },
      }
    );
    const { container } = render(
      <StyledComponent prop1={'value1'} prop2={'value2'} />
    );
    expect(container.firstChild).toHaveClass(class1);
    expect(container.firstChild).toHaveClass(class2);
  });

  it('merges variant config + class config + prop', () => {
    const class1 = 'class1';
    const class2 = 'class2';
    const class3 = 'class3';
    const StyledComponent = styled(TestComponent, class1, {
      variants: {
        prop1: {
          value1: class2,
        },
      },
    });

    const { container } = render(
      <StyledComponent className={class3} prop1={'value1'} />
    );
    expect(container.firstChild).toHaveClass(class1);
    expect(container.firstChild).toHaveClass(class2);
    expect(container.firstChild).toHaveClass(class3);
  });

  it('creates component from itrinsic HTML element key', () => {
    const elementNames: (keyof JSX.IntrinsicElements)[] = [
      'div',
      'span',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'a',
      'ul',
      'ol',
      'li',
      'table',
      'form',
      'fieldset',
      'legend',
      'label',
      'input',
      'button',
      'select',
      'option',
      'textarea',
      'article',
      'aside',
      'header',
      'footer',
      'nav',
      'section',
      'main',
      'dialog',
      'summary',
      'details',
      'menu',
    ];

    elementNames.forEach((elementName) => {
      const class1 = 'class1';
      const StyledComponent = styled(elementName, {
        variants: {
          active: {
            true: class1,
          },
        },
      });
      const { container } = render(<StyledComponent active />);
      expect(container.firstChild).toHaveClass(class1);
    });
  });

  it('passes through builtin component props', async () => {
    const class1 = 'class1';
    const CONTENT_TEXT = 'LABEL';
    const StyledComponent = styled('div', {
      variants: {
        active: {
          true: class1,
        },
      },
    });
    const handleClick = jest.fn();
    const { getByText } = render(
      <StyledComponent onClick={handleClick} active>
        {CONTENT_TEXT}
      </StyledComponent>
    );
    const label = getByText(CONTENT_TEXT);
    expect(label).toHaveClass(class1);
    userEvent.click(label);
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalled();
    });
  });

  it('does not forward variant props', () => {
    const classOpen = 'open';
    const classClosed = 'closed';
    const StyledComponent = styled(TestComponent, {
      variants: {
        open: {
          true: classOpen,
          false: classClosed,
        },
      },
    });
    const { getByText } = render(<StyledComponent open={true} />);
    const component = getByText('closed');
    expect(component).toHaveClass(classOpen);
  });

  it('does forward variant props configured via forwardProps', () => {
    const classOpen = 'open';
    const classClosed = 'closed';
    const StyledComponent = styled(TestComponent, {
      variants: {
        open: {
          true: classOpen,
          false: classClosed,
        },
      },
      forwardProps: ['open'],
    });
    const { getByText } = render(<StyledComponent open={true} />);
    const component = getByText('open');
    expect(component).toHaveClass(classOpen);
  });

  it('sets classes via defaultVariants', () => {
    const classOpen = 'open';
    const classClosed = 'closed';
    const StyledComponent = styled(TestComponent, {
      variants: {
        open: {
          true: classOpen,
          false: classClosed,
        },
      },
      defaultVariants: {
        open: true,
      },
    });
    const { getByText } = render(<StyledComponent />);
    const component = getByText('closed');
    expect(component).toHaveClass(classOpen);
  });

  it('sets compound classes via defaultVariants', () => {
    const classOpen = 'open';
    const classClosed = 'closed';
    const classOpenSuccess = 'open-success';
    const StyledComponent = styled(TestComponent, {
      variants: {
        open: {
          true: classOpen,
          false: classClosed,
        },
        success: {
          true: '',
          false: '',
        },
      },
      compoundVariants: [
        {
          open: true,
          success: true,
          className: classOpenSuccess,
        },
      ],
      defaultVariants: {
        open: true,
        success: true,
      },
    });
    const { getByText } = render(<StyledComponent />);
    const component = getByText('closed');
    expect(component).toHaveClass(classOpenSuccess);
  });

  it('handles forwardRef props for intrinsic HTML elements', () => {
    const PLACEHOLDER_TEXT = 'some placeholder';
    const class1 = 'class1';
    const SearchInput = React.forwardRef<
      HTMLInputElement,
      React.ComponentProps<'input'>
    >((props, ref) => {
      const { className, ...rest } = props;
      return (
        <input
          {...rest}
          className={className}
          ref={ref}
          type="search"
          placeholder={PLACEHOLDER_TEXT}
        />
      );
    });
    const StyledComponent = styled(SearchInput, {
      variants: {
        active: {
          true: class1,
        },
      },
    });

    const { getByPlaceholderText } = render(<StyledComponent active />);
    const input = getByPlaceholderText(PLACEHOLDER_TEXT);
    expect(input).not.toHaveFocus();
    input.focus();
    expect(input).toHaveFocus();
    expect(input).toHaveClass(class1);
  });

  it('adds compount variant classes', () => {
    const class1 = 'class1';
    const class2 = 'class2';
    const class3 = 'class3';
    const StyledComponent = styled(TestComponent, {
      variants: {
        prop1: {
          value1: class1,
        },
        prop2: {
          value2: class2,
        },
      },
      compoundVariants: [
        {
          prop1: 'value1',
          prop2: 'value2',
          className: class3,
        },
      ],
    });

    const { container } = render(
      <StyledComponent prop1={'value1'} prop2={'value2'} />
    );
    expect(container.firstChild).toHaveClass(class1);
    expect(container.firstChild).toHaveClass(class2);
    expect(container.firstChild).toHaveClass(class3);
  });

  it('merges classes from multiple compount variant configurations', () => {
    const class1 = 'class1';
    const class2 = 'class2';
    const class3 = 'class3';
    const class4 = 'class4';
    const StyledComponent = styled(TestComponent, {
      variants: {
        prop1: {
          value1: class1,
        },
        prop2: {
          value2: class2,
        },
      },
      compoundVariants: [
        {
          prop1: 'value1',
          prop2: 'value2',
          className: class3,
        },
        {
          prop1: 'value1',
          prop2: 'value2',
          className: class4,
        },
      ],
    });

    const { container } = render(
      <StyledComponent prop1={'value1'} prop2={'value2'} />
    );
    expect(container.firstChild).toHaveClass(class1);
    expect(container.firstChild).toHaveClass(class2);
    expect(container.firstChild).toHaveClass(class3);
    expect(container.firstChild).toHaveClass(class4);
  });

  it('does not add classes from unmatched compound variants', () => {
    const class1 = 'class1';
    const class2 = 'class2';
    const class3 = 'class3';
    const StyledComponent = styled(TestComponent, {
      variants: {
        prop1: {
          value1: class1,
          value2: class1,
        },
        prop2: {
          value2: class2,
        },
      },
      compoundVariants: [
        {
          prop1: 'value1',
          prop2: 'value2',
          className: class3,
        },
      ],
    });

    const { container } = render(
      <StyledComponent prop1={'value2'} prop2={'value2'} />
    );
    expect(container.firstChild).toHaveClass(class1);
    expect(container.firstChild).toHaveClass(class2);
    expect(container.firstChild).not.toHaveClass(class3);
  });
});

import { forwardRef } from 'react';
import NextLink from 'next/link';

const LinkBehaviour = forwardRef(function LinkBehaviour(props, ref) {
  return <NextLink ref={ref} {...props} />;
});

const link = {
  defaultProps: {
    component: LinkBehaviour,
    underline: "none",
    color: "inherit",
  },
};

export default link;

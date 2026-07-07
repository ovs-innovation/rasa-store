import dynamic from "next/dynamic";

const withNoSsr = (Component) => dynamic(() => Promise.resolve(Component), { ssr: false });

export default withNoSsr;

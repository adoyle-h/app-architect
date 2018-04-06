const assert = (val, message) => {
    if (!val) {
        if (!message) message = `${JSON.stringify(val)} == true`;
        throw new Error(`AssertionError: ${message}`);
    }
};

export default assert;

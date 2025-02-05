const CHARSET = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";

const getVarcharEight = () => {
  const randomArray = new Uint8Array(8);
  crypto.getRandomValues(randomArray);

  return Array.from(randomArray, (num) =>
    CHARSET.charAt(num % CHARSET.length)
  ).join("");
};

export { getVarcharEight };

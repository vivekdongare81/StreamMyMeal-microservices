export const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export const devError = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
}; 

export const prodLog = (...args: any[]) => {
    if (import.meta.env.PROD) {
      console.log(...args);
    }
  };
  
  export const prodError = (...args: any[]) => {
    if (import.meta.env.PROD) {
      console.error(...args);
    }
  }; 
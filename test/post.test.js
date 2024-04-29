import jest from 'jest'
test("test test", () => {
  const mock = jest.fn((a) => `test ${a}`);
  
  

  console.log(mock(33))
  expect(mock(44)).toBe("test 44");
});

describe("Testing library", () => {
  it("Should test that true is true", () => {
    // the keywords for tests are 2 (interchangeable): "it" or "test"
    expect(true).toBe(true)
  })

  it("Should test that true is true", () => {
    // the keywords for tests are 2 (interchangeable): "it" or "test"
    expect(true).toBe(true)
  })

  it("Should test null", () => {
    const n = null
    expect(n).toBeNull()
    expect(n).toBeDefined()
    expect(n).not.toBeUndefined()
    expect(n).toBeFalsy()
    expect(n).not.toBeTruthy()
  })
})

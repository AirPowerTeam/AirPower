/**
 * # 断言判断提示
 *
 * @author Hamm.cn
 */
export class AirAssert {
  /**
   * ### 断言条件成立时抛出异常
   * @param condition 条件
   * @param message 错误信息
   * @param description `可选` 错误描述
   */
  static when(condition: boolean, message: string, description?: string) {
    if (condition) {
      throw new Error(`\n\n[AirAssert Failed]: ${message || ''}\n${description}\n\n\n`)
    }
  }

  /**
   * ### 数据是否为 `null`
   * @param value 断言的值
   * @param message 错误信息
   * @param description `可选` 错误描述
   */
  static whenNull(value: unknown, message: string, description?: string) {
    return this.when(value === null, message, description)
  }

  /**
   * ### 数据是否为 `undefined`
   * @param value 断言的值
   * @param message 错误信息
   * @param description `可选` 错误描述
   */
  static whenUndefined(value: unknown, message: string, description?: string) {
    return this.when(value === undefined, message, description)
  }
}

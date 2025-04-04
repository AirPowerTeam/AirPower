import type { IDictionary } from './IDictionary'
import type { AirColorString, AirEnumKey } from './type'

/**
 * # 标准字典实现类
 *
 * @author Hamm.cn
 */
export class AirDictionary implements IDictionary {
  key!: AirEnumKey

  label!: string

  color?: AirColorString

  disabled?: boolean = false

  children?: this[]

  /**
   * ### 实例化一个标准字典选项
   * @param key `可选` 记录的key
   * @param label `可选` 记录的Label
   */
  constructor(key?: AirEnumKey, label?: string) {
    if (key) {
      this.key = key
    }
    if (label) {
      this.label = label
    }
  }

  /**
   * ### 设置字典的属性值
   * @param key 属性值
   */
  setKey(key: AirEnumKey): this {
    this.key = key
    return this
  }

  /**
   * ### 设置字典的描述
   * @param label 字典的描述
   */
  setLabel(label: string): this {
    this.label = label
    return this
  }

  /**
   * ### 设置字典是否被禁用
   * @param disabled `可选` 是否禁用
   */
  setDisabled(disabled = true): this {
    this.disabled = disabled
    return this
  }

  /**
   * ### 设置子集
   * @param children 子集
   */
  setChildren(children: this[]): this {
    this.children = children
    return this
  }
}

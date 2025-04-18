import type { IJson } from '../transformer'
import type { IFieldConfig } from './interface'
import type { DecoratorData, DecoratorTarget } from './type'
import { Constant } from '../config'
import { ClassTransformer } from '../transformer'

/**
 * # 装饰器工具类
 *
 * @author Hamm.cn
 */
export class DecoratorUtil {
  /**
   * ### 设置一个类配置项
   * @param target 目标实体类
   * @param classConfigKey 配置项索引键值
   * @param classConfig 配置的参数
   */
  static setClassConfig(target: DecoratorTarget, classConfigKey: string, classConfig: unknown) {
    this.setProperty(target.prototype, classConfigKey, classConfig)
  }

  /**
   * ### 递归获取指定类的配置项
   * @param target 目标类
   * @param classConfigKey 配置项的Key
   * @param defaultValue `可选` 类装饰器请传入配置项实例
   * @param isObject `可选` 是否是对象配置
   */
  static getClassConfig(
    target: DecoratorTarget,
    classConfigKey: string,
    defaultValue: unknown = undefined,
    isObject = false,
  ): DecoratorData {
    let classConfig = Reflect.get(target, classConfigKey)
    if (!isObject) {
      // 普通配置
      if (classConfig) {
        return classConfig
      }
      const superClass = Reflect.getPrototypeOf(target)
      if (!superClass || superClass.constructor.name === Constant.AIRPOWER) {
        return undefined
      }
      return this.getClassConfig(superClass, classConfigKey)
    }

    classConfig = classConfig || {}
    // 对象配置
    const superClass = Reflect.getPrototypeOf(target)
    if (!superClass || superClass.constructor.name === Constant.AIRPOWER) {
      return defaultValue
    }

    return {
      ...this.getClassConfig(superClass, classConfigKey, defaultValue, isObject),
      ...classConfig,
    }
  }

  /**
   * ### 设置一个属性配置项
   * @param target 目标类
   * @param key 属性
   * @param fieldConfigKey 配置项索引键值
   * @param fieldConfig 配置的参数
   * @param fieldListKey `可选` 类配置项列表索引值
   */
  static setFieldConfig(
    target: DecoratorTarget,
    key: string,
    fieldConfigKey: string,
    fieldConfig: unknown,
    fieldListKey?: string,
  ) {
    if (fieldListKey) {
      this.addFieldDecoratorKey(target, key, fieldListKey)
    }
    this.setProperty(target, `${fieldConfigKey}[${key}]`, fieldConfig)
  }

  /**
   * ### 获取类指定属性的指定类型的配置
   * @param target 目标类
   * @param key 属性
   * @param fieldConfigKey FieldConfigKey
   * @param isObject `可选` 是否对象配置
   */
  static getFieldConfig(
    target: DecoratorTarget,
    key: string,
    fieldConfigKey: string,
    isObject = false,
  ): DecoratorData {
    if (typeof target !== 'object') {
      target = target.prototype
    }
    let fieldConfig = Reflect.get(target, `${fieldConfigKey}[${key}]`)
    if (!isObject) {
      // 普通配置
      if (fieldConfig !== undefined) {
        return fieldConfig
      }
      // 没有查询到配置
      const superClass = Reflect.getPrototypeOf(target)
      if (!superClass || superClass.constructor.name === Constant.AIRPOWER) {
        return undefined
      }
      return this.getFieldConfig(superClass, key, fieldConfigKey)
    }

    // 对象配置
    fieldConfig = fieldConfig || {}
    // 没有查询到配置
    const superClass = Reflect.getPrototypeOf(target)
    if (!superClass || superClass.constructor.name === Constant.AIRPOWER) {
      return {}
    }
    return {
      ...this.getFieldConfig(superClass, key, fieldConfigKey, true),
      ...fieldConfig,
    }
  }

  /**
   * ### 获取类标记了装饰器的属性列表
   * @param target 目标类
   * @param fieldConfigKey FieldConfigKey
   * @param list `递归参数` 无需传入
   */
  static getFieldList(target: DecoratorTarget, fieldConfigKey: string, list: string[] = []): string[] {
    const fieldList: string[] = Reflect.get(target, fieldConfigKey) || []
    fieldList.forEach(item => list.includes(item) || list.push(item))
    const superClass = Reflect.getPrototypeOf(target)
    if (!superClass || superClass.constructor.name === Constant.AIRPOWER) {
      return list
    }
    return this.getFieldList(superClass, fieldConfigKey, list)
  }

  /**
   * ### 获取目标类指定属性列表的配置项列表
   * @param target 目标类
   * @param fieldListKey FieldListKey
   * @param fieldConfigKey FieldConfigKey
   * @param keyList 指定的属性数组
   */
  static getFieldConfigList<T extends IFieldConfig>(
    target: DecoratorTarget,
    fieldListKey: string,
    fieldConfigKey: string,
    keyList: string[],
  ): T[] {
    const fieldConfigList: T[] = []
    if (keyList.length === 0) {
      keyList = this.getFieldList(target, fieldListKey)
    }
    for (const fieldName of keyList) {
      const config = this.getFieldConfig(target, fieldName, fieldConfigKey)
      if (!config) {
        continue
      }
      const result: IJson = {}
      const configKeyList = Object.keys(config)
      configKeyList.forEach((configKey) => {
        if (configKey === 'key') {
          return
        }
        const fieldConfigValue = this.getFieldConfigValue(target, fieldConfigKey, config.key, configKey)
        if (fieldConfigValue === null || fieldConfigValue === undefined) {
          return
        }
        result[configKey] = fieldConfigValue
      })
      result.key = config.key
      result.label = config.label
      fieldConfigList.push(result as T)
    }

    return fieldConfigList
  }

  /**
   * ### 获取目标类上指定属性的某个配置的值
   * @param target 目标类
   * @param fieldConfigKey FieldConfigKey
   * @param key 属性
   * @param configKey 配置Key
   */
  static getFieldConfigValue(
    target: DecoratorTarget,
    fieldConfigKey: string,
    key: string,
    configKey: string,
  ): DecoratorData {
    const fieldConfig = ClassTransformer.copyJson(Reflect.get(target, `${fieldConfigKey}[${key}]`))
    if (fieldConfig && fieldConfig[configKey] !== undefined) {
      return fieldConfig[configKey]
    }
    const superClass = Object.getPrototypeOf(target)
    if (!superClass || superClass.constructor.name === Constant.AIRPOWER) {
      return undefined
    }
    return this.getFieldConfigValue(superClass, fieldConfigKey, key, configKey)
  }

  /**
   * ### 反射添加属性
   * @param target 目标类
   * @param key 配置key
   * @param value 配置值
   */
  private static setProperty(target: DecoratorTarget, key: string, value: unknown) {
    Reflect.defineProperty(target, key, {
      enumerable: false,
      value,
      writable: false,
      configurable: true,
    })
  }

  /**
   * ### 设置一个属性的包含装饰器索引
   * @param target 目标类
   * @param key 属性
   * @param fieldListKey 类配置项列表索引值
   */
  private static addFieldDecoratorKey(target: DecoratorTarget, key: string, fieldListKey: string) {
    const list: string[] = Reflect.get(target, fieldListKey) || []
    list.push(key)
    this.setProperty(target, fieldListKey, list)
  }
}

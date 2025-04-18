# 工具库

**AirPower** 提供了一些常用的工具类，你可以直接使用。

## CryptoUtil 编码和加解密

内置了 `AES加解密`、`SHA1`、`MD5`、`Base64` 等前端常用算法，可直接使用。

```typescript
CryptoUtil.aesEncrypt()
CryptoUtil.aesDecrypt()
CryptoUtil.sha1()
CryptoUtil.md5()
CryptoUtil.base64Encode()
CryptoUtil.base64Decode()
```

## DateTimeUtil 时间与日期

提供了日期时间在前端常用的一些转换方法：

```typescript
// 休眠
await DateTimeUtil.sleep(3000)

// 格式化到Unix秒时间戳(默认当前时间)
DateTimeUtil.getUnixTimeStamps('2022-02-02 23:59:59')

// 格式化到毫秒时间戳(默认当前时间)
DateTimeUtil.getMilliTimeStamps('2022-02-02 23:59:59')

// 格式化到友好字符串显示
DateTimeUtil.getFriendlyDateTime('2022-02-02 23:59:59') // 三天前

// 使用指定的模板格式化
DateTimeFormatter.YYYY_MM_DD_HH_mm_ss.formatXXX(xxx)
```

## DecoratorUtil 装饰器

装饰器助手类提供了一些设置和读取配置项的方法：

```typescript
// 反射添加属性
DecoratorUtil.setProperty()

// 设置一个类配置项
DecoratorUtil.setClassConfig()

// 递归获取指定类的配置项
DecoratorUtil.getClassConfig()

// 设置一个属性配置项
DecoratorUtil.setFieldConfig()

// 获取类指定属性的指定类型的配置
DecoratorUtil.getFieldConfig()

// 获取类标记了装饰器的属性列表
DecoratorUtil.getFieldList()

// 获取目标类指定属性列表的配置项列表
DecoratorUtil.getFieldConfigList()

// 获取目标类上指定属性的某个配置的值
DecoratorUtil.getFieldConfigValue()
```

## FileUtil 文件

提供了一些常用文件处理方法

```typescript
// 字节数转可读文件大小
FileUtil.getFileSizeFriendly()

// 获取静态文件的绝对地址
FileUtil.getAbsoluteFileUrl()
```

## RandomUtil 随机生成

提供了一些常用随机生成方法

```typescript
// 指定范围内获取随机整数
RandomUtil.getRandNumber()

// 获取随机数字字符串
RandomUtil.getRandNumberString()

// 获取随机字母字符串
RandomUtil.getRandCharString()

// 获取大小写混合随机字母字符串
RandomUtil.getRandMixedCharString()

// 获取字母加数字随机字符串
RandomUtil.getRandNumberAndCharString()

// 获取大小写字母加数字随机字符串
RandomUtil.getRandNumberAndMixedCharString()
```

## StringUtil 字符串常见处理

提供了一些字符串处理的常见方法

```typescript
// 获取字符串可视化长度
StringUtil.getLength()

// 获取字符串可视化位置的内容
StringUtil.get()

// 字符串可视化截取
StringUtil.slice()
```

# SMTP 设置待办事项

## 当前状态
- 目前使用 Supabase 内置邮件服务
- 适合个人使用和开发测试
- 内置服务有速率限制，但对个人使用影响不大

## 为什么需要设置 SMTP
- **生产环境**：当用户量增加时，内置邮件服务可能达到速率限制
- **邮件可靠性**：自定义 SMTP 服务提供更高的邮件送达率
- **品牌一致性**：可以使用自己的域名发送邮件，提高用户信任度
- **邮件统计**：可以获得更详细的邮件发送统计和分析

## 推荐的 SMTP 服务提供商
1. **SendGrid**
   - 免费额度：每月 100 封免费邮件
   - 优势：配置简单，文档完善
   - 适合：中小规模应用

2. **Amazon SES**
   - 免费额度：每月前 62,000 封邮件免费
   - 优势：价格低廉，适合大量邮件
   - 适合：大规模应用

3. **Mailgun**
   - 免费额度：每月 5,000 封免费邮件
   - 优势：功能丰富，分析工具强大
   - 适合：企业级应用

4. **Gmail/Office 365**
   - 优势：使用现有邮箱账户
   - 适合：小型应用或个人项目

## 设置步骤
1. **选择并注册 SMTP 服务提供商**
2. **获取 SMTP 配置信息**
   - SMTP Host
   - SMTP Port
   - Username
   - Password/API Key

3. **在 Supabase 控制台配置**
   - 访问 Authentication > Emails > SMTP Settings
   - 点击 "Set up SMTP"
   - 填写配置信息
   - 保存更改
   - 发送测试邮件验证配置

4. **更新邮件模板**
   - 访问 Authentication > Emails > Templates
   - 自定义邮件模板内容和样式

## 待办事项
- [ ] 选择合适的 SMTP 服务提供商
- [ ] 获取 SMTP 配置信息
- [ ] 在 Supabase 控制台配置 SMTP
- [ ] 验证 SMTP 配置是否成功
- [ ] 自定义邮件模板

## 优先级
- **当前**：低（个人使用阶段）
- **未来**：中（当用户量增加时）

## 参考链接
- [Supabase 邮件配置文档](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SendGrid SMTP 配置](https://docs.sendgrid.com/for-developers/sending-email/smtp)
- [Amazon SES 入门指南](https://docs.aws.amazon.com/ses/latest/dg/quick-start.html)
# Anthropic 把 Agent 的脑和手拆开了：Managed Agents 架构全拆解

容器一挂，整个 agent 跟着没了，Anthropic 第一版托管 agent 就是这样。后来把 agent 拆开：session 日志单独存放，Claude 加 harness 当「脑」，沙箱当「手」。对照 Latent Space 访谈和官方博客，讲清拆分后首 token 延迟中位数为什么降了约 60%，钥匙为什么不再进沙箱，一个脑怎么连多只手，以及会「做梦」整理记忆的 Dreaming。

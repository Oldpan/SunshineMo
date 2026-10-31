# 一个人最多盯 5 个 Session：DeepSeek 团队的 Super-agent 架构全拆解

DeepSeek Harness 团队观察到，一个人通常只能同时跟进 3 到 5 个活跃 Session，多任务的上限是人的注意力。这期按原文顺序讲透他们的 Super-agent 架构：Router/Worker 双层架构、事件过滤与订阅直通、链式召回、投机执行、全双工交互、存算分离和外部 Watchdog，再看初步实验里的完成时间、token 开销和批处理数据。适合做 Agent 系统的工程师。

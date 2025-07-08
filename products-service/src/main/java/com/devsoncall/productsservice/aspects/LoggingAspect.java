package com.devsoncall.productsservice.aspects;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Slf4j
@Component
public class LoggingAspect {

    @Pointcut(value = "execution(* com.microservices.products.*.*.*(..) )")
    public void springBeanPointcut() {}

    @Around("springBeanPointcut()")
    public Object logAround(ProceedingJoinPoint pjp) throws Throwable {
        log.info("Logging Aspect -> "+ pjp.getTarget().getClass().toString()+" -> "+pjp.getSignature().getName().toString());

        return pjp.proceed();
    }
}

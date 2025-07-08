package com.devsoncall.productsservice.aspects;

import brave.Tracing;
import brave.baggage.BaggageField;
import brave.baggage.BaggagePropagation;
import brave.baggage.BaggagePropagationConfig;
import brave.handler.SpanHandler;
import brave.propagation.B3Propagation;
import brave.propagation.StrictCurrentTraceContext;
import brave.sampler.Sampler;
import io.micrometer.tracing.CurrentTraceContext;
import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import io.micrometer.tracing.brave.bridge.BraveBaggageManager;
import io.micrometer.tracing.brave.bridge.BraveCurrentTraceContext;
import io.micrometer.tracing.brave.bridge.BraveTracer;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import zipkin2.reporter.AsyncReporter;
import zipkin2.reporter.brave.ZipkinSpanHandler;
import zipkin2.reporter.urlconnection.URLConnectionSender;

@Aspect
@Component
@Slf4j
public class TracingAspect {
    private Tracer tracer;

    public TracingAspect(){
        SpanHandler spanHandler = ZipkinSpanHandler
                .create(AsyncReporter.create(URLConnectionSender.create("http://localhost:9411/api/v2/spans")));

        StrictCurrentTraceContext braveCurrentTraceContext = StrictCurrentTraceContext.create();

        CurrentTraceContext bridgeContext = new BraveCurrentTraceContext(braveCurrentTraceContext);

        Tracing tracing = Tracing.newBuilder().currentTraceContext(braveCurrentTraceContext).supportsJoin(false)
                .traceId128Bit(true)
                // For Baggage to work you need to provide a list of fields to propagate
                .propagationFactory(BaggagePropagation.newFactoryBuilder(B3Propagation.FACTORY)
                        .add(BaggagePropagationConfig.SingleBaggageField
                                .remote(BaggageField.create("from_span_in_scope 1")))
                        .add(BaggagePropagationConfig.SingleBaggageField
                                .remote(BaggageField.create("from_span_in_scope 2")))
                        .add(BaggagePropagationConfig.SingleBaggageField.remote(BaggageField.create("from_span")))
                        .build())
                .sampler(Sampler.ALWAYS_SAMPLE).localServiceName("product-service").addSpanHandler(spanHandler).build();

        brave.Tracer braveTracer = tracing.tracer();

        this.tracer = new BraveTracer(braveTracer, bridgeContext, new BraveBaggageManager());
    }

    @Pointcut(value = "execution(* com.microservices.products.Services.*.*(..) )")
    public void springBeanPointcut() {}

    @Around("springBeanPointcut()")
    public Object traceAround(ProceedingJoinPoint pjp) throws Throwable {
        log.info("Tracing Aspect -> "+ pjp.getTarget().getClass().toString()+" -> "+pjp.getSignature().getName().toString());

        Span span = this.tracer.nextSpan().name(pjp.getSignature().getName().toString());

        try (Tracer.SpanInScope ws = this.tracer.withSpan(span.start())) {
            if (span != null) {
                log.info("Span ID {}", span.context().spanId());
                log.info("Trace ID {}", span.context().traceId());
                log.info("Parent ID {}", span.context().parentId());
            }
            span.event(pjp.getSignature().getName().toString());
        }finally {
            span.end();
        }

        return pjp.proceed();
    }

}

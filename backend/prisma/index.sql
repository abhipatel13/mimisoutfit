
CREATE INDEX IF NOT EXISTS idx_products_search
ON products
USING GIN (
  to_tsvector('english',
    name || ' ' || coalesce(brand, '') || ' ' || coalesce(description, '')
  )
);


CREATE INDEX IF NOT EXISTS idx_event_type_date ON "AnalyticsEvent"("eventType", "createdAt");
CREATE INDEX IF NOT EXISTS idx_product_date ON "AnalyticsEvent"("productId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_moodboard_date ON "AnalyticsEvent"("moodboardId", "createdAt");
-- Create stock management functions

-- Function to decrement product stock with better error handling and logging
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
DECLARE
    v_current_stock INTEGER;
    v_product_name VARCHAR(255);
BEGIN
    -- Get current stock and product name
    SELECT stock, name INTO v_current_stock, v_product_name
    FROM products
    WHERE id = p_product_id;

    -- Check if product exists
    IF v_product_name IS NULL THEN
        RAISE EXCEPTION 'Product with ID % not found', p_product_id;
    END IF;

    -- Check if enough stock is available
    IF v_current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product % (%). Requested: %, Available: %', 
            p_product_id, v_product_name, p_quantity, v_current_stock;
    END IF;

    -- Update stock
    UPDATE products
    SET 
        stock = stock - p_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;

    -- Log the stock update in admin_activity_logs
    INSERT INTO admin_activity_logs (
        action_type,
        entity_type,
        entity_id,
        details
    ) VALUES (
        'stock_update',
        'product',
        p_product_id,
        jsonb_build_object(
            'previous_stock', v_current_stock,
            'quantity_decreased', p_quantity,
            'new_stock', v_current_stock - p_quantity,
            'product_name', v_product_name
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and re-raise
        INSERT INTO admin_activity_logs (
            action_type,
            entity_type,
            entity_id,
            details
        ) VALUES (
            'stock_update_error',
            'product',
            p_product_id,
            jsonb_build_object(
                'error', SQLERRM,
                'requested_quantity', p_quantity,
                'current_stock', v_current_stock,
                'product_name', v_product_name
            )
        );
        RAISE;
END;
$$ LANGUAGE plpgsql;

-- Create index for stock updates
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Add trigger to prevent negative stock
CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock < 0 THEN
        RAISE EXCEPTION 'Cannot set negative stock for product %', NEW.name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS check_stock_not_negative ON products;

-- Create trigger
CREATE TRIGGER check_stock_not_negative
    BEFORE UPDATE OR INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION prevent_negative_stock(); 
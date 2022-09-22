
CREATE OR REPLACE FUNCTION update_penjualan() RETURNS TRIGGER AS $set_penjualan$
    DECLARE
    stok_lama INTEGER;
    sum_harga NUMERIC;
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            --update stok
            SELECT stock INTO stok_lama FROM varian WHERE barcode = NEW.barcode;
            UPDATE varian SET stock = stok_lama - NEW.qty WHERE barcode = NEW.barcode;

        ELSIF (TG_OP = 'UPDATE') THEN
            --update stok
            SELECT stock INTO stok_lama FROM varian WHERE barcode = NEW.barcode;
            UPDATE varian SET stock = stok_lama + OLD.qty - NEW.qty WHERE barcode = NEW.barcode;
            
        ELSIF (TG_OP = 'DELETE') THEN
            --update stok
            SELECT stock INTO stok_lama FROM varian WHERE barcode = NEW.barcode;
            UPDATE varian SET stock = stok_lama + NEW.qty WHERE barcode = NEW.barcode;

        END IF;
        -- update penjualan
        SELECT sum(total_harga) INTO sum_harga FROM detail_penjualan WHERE no_invoice = NEW.no_invoice;
        UPDATE penjualan SET total_harga = sum_harga WHERE no_invoice = NEW.no_invoice;

        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$set_penjualan$ LANGUAGE plpgsql;

CREATE TRIGGER set_penjualan
AFTER INSERT OR UPDATE OR DELETE ON detail_penjualan
    FOR EACH ROW EXECUTE FUNCTION update_penjualan();



-- update total harga
CREATE OR REPLACE FUNCTION update_harga() RETURNS TRIGGER AS $set_total_harga$
    DECLARE
        harga_jual_barang NUMERIC;
    BEGIN
        SELECT sell_price INTO harga_jual_barang FROM varian WHERE barcode = NEW.barcode;
        NEW.harga_jual := harga_jual_barang;
        NEW.total_harga := NEW.qty * harga_jual_barang;
        RETURN NEW;
    END;
$set_total_harga$ LANGUAGE plpgsql;

CREATE TRIGGER set_total_harga
BEFORE INSERT OR UPDATE ON detail_penjualan
    FOR EACH ROW EXECUTE FUNCTION update_harga();

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_pembelian() RETURNS TRIGGER AS $set_pembelian$
    DECLARE
    stok_lama INTEGER;
    sum_harga NUMERIC;
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            --update stok
            SELECT stock INTO stok_lama FROM varian WHERE barcode = NEW.barcode;
            UPDATE varian SET stock = stok_lama + NEW.qty WHERE barcode = NEW.barcode;

        ELSIF (TG_OP = 'UPDATE') THEN
            --update stok
            SELECT stock INTO stok_lama FROM varian WHERE barcode = NEW.barcode;
            UPDATE varian SET stock = stok_lama - OLD.qty + NEW.qty WHERE barcode = NEW.barcode;
            
        ELSIF (TG_OP = 'DELETE') THEN
            --update stok
            SELECT stock INTO stok_lama FROM varian WHERE barcode = NEW.barcode;
            UPDATE varian SET stock = stok_lama - NEW.qty WHERE barcode = NEW.barcode;

        END IF;
        -- update pembelian
        SELECT sum(total_harga) INTO sum_harga FROM detail_pembelian WHERE no_invoice = NEW.no_invoice;
        UPDATE pembelian SET total_harga = sum_harga WHERE no_invoice = NEW.no_invoice;

        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$set_pembelian$ LANGUAGE plpgsql;

CREATE TRIGGER set_pembelian
AFTER INSERT OR UPDATE OR DELETE ON detail_pembelian
    FOR EACH ROW EXECUTE FUNCTION update_pembelian();



-- update total harga2
CREATE OR REPLACE FUNCTION update_harga2() RETURNS TRIGGER AS $set_total_harga2$
    DECLARE
        harga_beli_barang NUMERIC;
    BEGIN
        SELECT buy_price INTO harga_beli_barang FROM varian WHERE barcode = NEW.barcode;
        NEW.harga_beli := harga_beli_barang;
        NEW.total_harga := NEW.qty * harga_beli_barang;
        RETURN NEW;
    END;
$set_total_harga2$ LANGUAGE plpgsql;

CREATE TRIGGER set_total_harga2
BEFORE INSERT OR UPDATE ON detail_pembelian
    FOR EACH ROW EXECUTE FUNCTION update_harga2();
   
    
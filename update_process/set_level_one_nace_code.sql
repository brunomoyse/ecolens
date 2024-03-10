UPDATE ingestion.enterprises
SET nace_letter= 'A'
WHERE nace_main[1] LIKE '01%'
	OR nace_main[1] LIKE '02%'
	OR nace_main[1] LIKE '03%';

UPDATE ingestion.enterprises
SET nace_letter= 'B'
WHERE nace_main[1] LIKE '05%'
	OR nace_main[1] LIKE '06%'
	OR nace_main[1] LIKE '07%'
	OR nace_main[1] LIKE '08%'
	OR nace_main[1] LIKE '09%';

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 10..33 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''C'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

UPDATE ingestion.enterprises
SET nace_letter= 'D'
WHERE nace_main[1] LIKE '35%';

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 36..39 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''E'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 41..43 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''F'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 45..47 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''G'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 49..53 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''H'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 55..56 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''I'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 58..63 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''J'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 64..66 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''K'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

UPDATE ingestion.enterprises
SET nace_letter= 'L'
WHERE nace_main[1] LIKE '68%';

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 69..75 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''M'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 77..82 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''N'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

UPDATE ingestion.enterprises
SET nace_letter= 'O'
WHERE nace_main[1] LIKE '84%';

UPDATE ingestion.enterprises
SET nace_letter= 'P'
WHERE nace_main[1] LIKE '85%';

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 86..88 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''Q'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 90..93 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''R'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 94..96 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''S'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

DO $$
DECLARE
    i int;
BEGIN
    FOR i IN 97..98 LOOP
        EXECUTE format('UPDATE ingestion.enterprises SET nace_letter = ''T'' WHERE nace_main[1] LIKE ''%s%%''', i);
    END LOOP;
END $$;

UPDATE ingestion.enterprises
SET nace_letter= 'U'
WHERE nace_main[1] LIKE '99%';
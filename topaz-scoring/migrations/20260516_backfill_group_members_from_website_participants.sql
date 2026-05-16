-- One-time backfill: scoring entries.group_members had name-only strings from early sync.
-- Rebuilt from website registrations.participants_json (matched by registrations.scoring_app_contestant_id = entries.id).
-- Safe to re-run: same target UUIDs only.

UPDATE entries AS e
SET group_members = v.gm
FROM (
  VALUES
    ('ae1d835d-3751-4315-81a5-6bc019c72ede'::uuid, '[{"age": 26, "name": "Jy"}, {"age": 25, "name": "My"}]'::jsonb),
    ('e47b4fb9-bbfb-436a-a456-3ebb951fc9bd'::uuid, '[{"age": 10, "name": "B"}, {"age": 9, "name": "C"}, {"age": 8, "name": "D"}, {"age": 9, "name": "E"}]'::jsonb),
    ('6e7e5af7-12b2-46db-ad89-9dafbc8ca762'::uuid, '[{"age": 20, "name": "Aa"}, {"age": 20, "name": "Bcd"}]'::jsonb),
    ('d31c395f-4c90-4cf0-a1d0-d2cd531ecab2'::uuid, '[{"age": 20, "name": "Bcd"}, {"age": 20, "name": "Aa"}]'::jsonb),
    ('1bbb773d-e6c8-4326-9871-e11273f30342'::uuid, '[{"age": 26, "name": "Duo2"}, {"age": 26, "name": "Duo1"}]'::jsonb),
    ('dfaf4c16-00b1-4be1-82a9-2c24faaec80b'::uuid, '[{"age": 26, "name": "Duo1"}, {"age": 26, "name": "Duo2"}]'::jsonb),
    ('4ad4972b-72f0-4490-aba2-b11d209bc9cc'::uuid, '[{"age": 6, "name": "fred york"}, {"age": 7, "name": "wendy shorts"}, {"age": 6, "name": "bugur"}]'::jsonb),
    ('da7b3aab-805d-4632-88b9-d53dc4982fd4'::uuid, '[{"age": 6, "name": "Fred york"}, {"age": 7, "name": "Wendy shorts"}, {"age": 6, "name": "Bugur"}]'::jsonb),
    ('3e126c6c-0281-4151-8949-43f38e1f2eed'::uuid, '[{"age": 6, "name": "FRED YORK"}, {"age": 6, "name": "BUGER"}, {"age": 7, "name": "WENDY SHORTS"}]'::jsonb)
) AS v(id, gm)
WHERE e.id = v.id;

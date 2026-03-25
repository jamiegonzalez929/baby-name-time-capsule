import pathlib
import tempfile
import unittest

from scripts.build_data import build_dataset, build_streaks, build_top_by_year, load_rows, write_dataset


FIXTURE_ROWS = [
    {"year": 2000, "name": "Liam", "percent": 0.0900, "sex": "boy"},
    {"year": 2000, "name": "Noah", "percent": 0.0800, "sex": "boy"},
    {"year": 2000, "name": "Emma", "percent": 0.1100, "sex": "girl"},
    {"year": 2000, "name": "Olivia", "percent": 0.1000, "sex": "girl"},
    {"year": 2001, "name": "Liam", "percent": 0.0850, "sex": "boy"},
    {"year": 2001, "name": "Noah", "percent": 0.0830, "sex": "boy"},
    {"year": 2001, "name": "Emma", "percent": 0.1050, "sex": "girl"},
    {"year": 2001, "name": "Ava", "percent": 0.1010, "sex": "girl"},
    {"year": 2002, "name": "Liam", "percent": 0.0820, "sex": "boy"},
    {"year": 2002, "name": "Lucas", "percent": 0.0790, "sex": "boy"},
    {"year": 2002, "name": "Emma", "percent": 0.1040, "sex": "girl"},
    {"year": 2002, "name": "Olivia", "percent": 0.1020, "sex": "girl"},
]


class BuildDataTests(unittest.TestCase):
    def test_build_top_by_year_ranks_and_scales_percentages(self):
        top_by_year = build_top_by_year(FIXTURE_ROWS, top_n=2)
        self.assertEqual(top_by_year["2000"]["boy"][0]["name"], "Liam")
        self.assertEqual(top_by_year["2000"]["boy"][0]["rank"], 1)
        self.assertAlmostEqual(top_by_year["2000"]["boy"][0]["percent"], 9.0)
        self.assertEqual(top_by_year["2001"]["girl"][1]["name"], "Ava")

    def test_build_streaks_finds_longest_continuous_runs(self):
        streaks = build_streaks(FIXTURE_ROWS, top_k=1, limit=5)
        self.assertEqual(streaks["boy"][0]["name"], "Liam")
        self.assertEqual(streaks["boy"][0]["years"], 3)
        self.assertEqual(streaks["girl"][0]["name"], "Emma")
        self.assertEqual(streaks["girl"][0]["start_year"], 2000)

    def test_build_dataset_contains_metadata_and_top_n(self):
        dataset = build_dataset(FIXTURE_ROWS, top_n=2)
        self.assertEqual(dataset["year_range"]["start"], 2000)
        self.assertEqual(dataset["year_range"]["end"], 2002)
        self.assertEqual(dataset["top_n"], 2)
        self.assertIn("streaks", dataset)

    def test_load_rows_and_write_dataset_round_trip(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            csv_path = pathlib.Path(tmpdir) / "fixture.csv"
            csv_path.write_text(
                "year,name,percent,sex\n2000,Liam,0.09,boy\n2000,Emma,0.11,girl\n",
                encoding="utf-8",
            )
            rows = load_rows(csv_path)
            self.assertEqual(rows[0]["year"], 2000)
            self.assertEqual(rows[1]["name"], "Emma")

            output_path = pathlib.Path(tmpdir) / "out.json"
            write_dataset(build_dataset(rows, top_n=1), output_path=output_path)
            self.assertTrue(output_path.exists())


if __name__ == "__main__":
    unittest.main()

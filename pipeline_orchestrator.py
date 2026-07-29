from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

from spiders.openalex_spider import OpenAlexSpider


def main():
    process = CrawlerProcess(get_project_settings())
    process.crawl(OpenAlexSpider)
    process.start()


if __name__ == "__main__":
    main()

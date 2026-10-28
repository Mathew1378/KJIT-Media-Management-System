import docx
from docx.oxml import parse_xml

doc = docx.Document()
section = doc.sections[0]
pgBorders = parse_xml(
    '<w:pgBorders xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:offsetFrom="page">'
    '<w:top w:val="single" w:sz="12" w:space="24" w:color="000000"/>'
    '<w:left w:val="single" w:sz="12" w:space="24" w:color="000000"/>'
    '<w:bottom w:val="single" w:sz="12" w:space="24" w:color="000000"/>'
    '<w:right w:val="single" w:sz="12" w:space="24" w:color="000000"/>'
    '</w:pgBorders>'
)
section._sectPr.append(pgBorders)
doc.save('documentation/final-report/test_border.docx')
print('Page border test passed successfully!')

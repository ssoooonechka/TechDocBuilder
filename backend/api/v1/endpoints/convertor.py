from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re

router = APIRouter(
    prefix="/convertor",
    tags=["convertor"]
)

class SqlConversionRequest(BaseModel):
    sql: str

class SqlConversionResponse(BaseModel):
    markdown: str

@router.post("/sql_to_markdown", response_model=SqlConversionResponse)
async def convert_sql_to_markdown(request: SqlConversionRequest):
    try:
        markdown_table = parse_sql_to_markdown(request.sql)
        return {"markdown": markdown_table}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def parse_sql_to_markdown(sql: str) -> str:
    sql = re.sub(r'--.*?$', '', sql, flags=re.MULTILINE)
    sql = re.sub(r'/\*.*?\*/', '', sql, flags=re.DOTALL)
    sql = re.sub(r'\s+', ' ', sql).strip()

    table_name_match = re.search(
        r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?',
        sql, re.IGNORECASE
    )
    table_name = table_name_match.group(1) if table_name_match else "table"

    columns_start = sql.find('(')
    if columns_start == -1:
        return f"# {table_name}\n\nСтолбцов не обнаружено"

    columns_sql = sql[columns_start + 1:]
    columns_end = columns_sql.rfind(')')
    if columns_end != -1:
        columns_sql = columns_sql[:columns_end]

    columns_sql = re.sub(r'\b(?:CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)\b.*?(?:,|$)', '', columns_sql, flags=re.IGNORECASE)

    column_pattern = re.compile(
        r'`?(\w+)`?\s+([\w]+(?:\(\d+\))?)\s*'
        r'(?:NOT\s+NULL\s*)?'
        r'(?:DEFAULT\s+(?:NULL|[\w\'\"]+)\s*)?',
        re.IGNORECASE
    )

    columns = []
    for column_def in columns_sql.split(','):
        column_def = column_def.strip()
        if not column_def:
            continue

        match = column_pattern.match(column_def)
        if not match:
            continue

        name = match.group(1)
        type_ = match.group(2).upper()
        constraints = []

        if "NOT NULL" in column_def.upper():
            constraints.append("NOT NULL")

        columns.append({
            "name": name,
            "type": type_,
            "constraints": ", ".join(constraints)
        })

    if not columns:
        return f"# {table_name}\n\nСтолбцов не найдено"

    max_name_len = max(len(col["name"]) for col in columns)
    max_type_len = max(len(col["type"]) for col in columns)
    max_constraints_len = max(len(col["constraints"]) for col in columns) if any(col["constraints"] for col in columns) else 0

    markdown = [f"# {table_name}\n\n"]

    header_name = "Поле".ljust(max_name_len)
    header_type = "Тип".ljust(max_type_len)
    header_constraints = "Свойства".ljust(max_constraints_len)

    markdown.append(f"| {header_name} | {header_type} | {header_constraints} |")

    separator = f"|{'-' * (max_name_len + 2)}|{'-' * (max_type_len + 2)}|{'-' * (max_constraints_len + 2)}|"
    markdown.append(separator)

    for col in columns:
        name = col["name"].ljust(max_name_len)
        type_ = col["type"].ljust(max_type_len)
        constraints = col["constraints"].ljust(max_constraints_len)
        markdown.append(f"| {name} | {type_} | {constraints} |")

    return "\n".join(markdown)
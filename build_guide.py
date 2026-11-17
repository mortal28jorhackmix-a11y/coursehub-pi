from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.section import WD_SECTION

out = r'C:\Users\Usuario\Desktop\coursehub-pi\Guia_Autorizacion_Defensa_CourseHub.docx'
doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(.7); sec.bottom_margin = Inches(.7); sec.left_margin = Inches(.8); sec.right_margin = Inches(.8)
styles = doc.styles
styles['Normal'].font.name='Aptos'; styles['Normal'].font.size=Pt(10); styles['Normal'].font.color.rgb=RGBColor(48,58,72)
styles['Normal'].paragraph_format.space_after=Pt(5)
for n,size,color in [('Title',26,'D92D3A'),('Heading 1',17,'D92D3A'),('Heading 2',12,'17365D')]:
 s=styles[n]; s.font.name='Aptos Display'; s.font.size=Pt(size); s.font.bold=True; s.font.color.rgb=RGBColor.from_string(color)
 s.paragraph_format.space_before=Pt(10); s.paragraph_format.space_after=Pt(5)
# code style
if 'Code Block' not in styles:
 s=styles.add_style('Code Block',1); s.font.name='Consolas'; s.font.size=Pt(8); s.font.color.rgb=RGBColor(35,48,64); s.paragraph_format.left_indent=Inches(.12); s.paragraph_format.space_before=Pt(2); s.paragraph_format.space_after=Pt(4)

def shade(cell, fill):
 tcPr=cell._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),fill); tcPr.append(shd)
def set_cell(cell,text,bold=False,color=None):
 cell.text=''; p=cell.paragraphs[0]; p.paragraph_format.space_after=Pt(2); r=p.add_run(text); r.bold=bold; r.font.name='Aptos'; r.font.size=Pt(9)
 if color:r.font.color.rgb=RGBColor.from_string(color)

def para(text=''):
 return doc.add_paragraph(text)
def code(text):
 for line in text.strip('\n').split('\n'):
  p=doc.add_paragraph(style='Code Block'); p.paragraph_format.keep_together=True
  pPr=p._p.get_or_add_pPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),'F1F4F8'); pPr.append(shd)
  p.add_run(line if line else ' ')
def bullets(items):
 for x in items: doc.add_paragraph(x,style='List Bullet')
def numbered(items):
 for x in items: doc.add_paragraph(x,style='List Number')
def table(rows,widths=None):
 t=doc.add_table(rows=0,cols=len(rows[0])); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.style='Light Shading Accent 1'
 for ri,row in enumerate(rows):
  cells=t.add_row().cells
  for i,txt in enumerate(row):
   set_cell(cells[i],txt,bold=(ri==0),color=('FFFFFF' if ri==0 else None))
   if ri==0: shade(cells[i],'17365D')
   cells[i].vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
 return t

p=doc.add_paragraph(style='Title'); p.add_run('Autorización y defensa en profundidad')
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.LEFT
r=p.add_run('Guía práctica para aplicar los requisitos al proyecto CourseHub API'); r.bold=True; r.font.size=Pt(13); r.font.color.rgb=RGBColor(23,54,93)
para('Esta guía te orienta para completar manualmente los seis controles de la actividad. El proyecto ya tiene roles, autenticación JWT en operaciones de cursos y control de propiedad del curso; debes verificar esos puntos y completar limitación de intentos, CORS y la documentación de HTTPS/TLS. Al final tendrás una lista de evidencias para pegar en tu informe de Word.')
table([['Requisito de la actividad','Estado observado en CourseHub'],['Rol por defecto de menor privilegio','Implementado: User.role usa STUDENT como predeterminado.'],['Ruta administrativa protegida por JWT y rol; sin rol suficiente, 403','Parcial/implementado en cursos: JwtAuthGuard y RolesGuard. La ruta es la que marques como administrativa.'],['Un docente no modifica cursos ajenos','Implementado en CoursesService.update mediante createdByUserId.'],['CORS solo con orígenes documentados','Pendiente: no se encontró configuración CORS en src/main.ts.'],['POST /auth/login limitado y 429 al exceder','Pendiente: no se encontró throttler ni rate limit.'],['README requiere HTTPS/TLS en producción','Pendiente: el README no lo declara actualmente.']])

doc.add_heading('1. Comprende el alcance antes de editar',level=1)
para('Abre el proyecto en VS Code y ubica los archivos indicados en cada paso. Trabaja en una rama o copia de respaldo si tu curso lo requiere. El proyecto usa NestJS, TypeScript y PostgreSQL. No copies secretos ni el contenido de .env a capturas: JWT_SECRET y las credenciales de base de datos son privadas.')
para('Importante sobre los roles: el registro actual crea usuarios con el rol predeterminado student. Eso es una buena base de menor privilegio. No permitas que cualquier persona elija admin durante el registro. Para probar roles, asigna teacher/admin solo a usuarios de prueba mediante un procedimiento local controlado.')

doc.add_heading('2. Verifica el rol de menor privilegio',level=1)
para('Archivo: src/users/entities/user.entity.ts y src/users/user-role.enum.ts. La entidad ya declara role como enum y usa UserRole.STUDENT como valor por defecto. Los únicos valores son admin, teacher y student.')
numbered(['Confirma que el registro no recibe un campo role capaz de elevar privilegios. Revisa src/auth/dto/register.dto.ts.', 'Conserva STUDENT como rol por defecto. Si el DTO tuviera role, quítalo del registro público o ignóralo en el servicio.', 'Documenta que un usuario nuevo comienza como estudiante y que la asignación de roles privilegiados es administrativa.', 'Captura el enum, la columna role con default STUDENT y el DTO de registro.'])
para('Criterio de aceptación: crear una cuenta con solo correo y contraseña no produce un usuario admin ni teacher; queda como student.')

doc.add_heading('3. Protege una ruta administrativa con JWT y rol',level=1)
para('El guard JWT revisa que exista un Bearer token válido y coloca el usuario autenticado en la petición. RolesGuard comprueba el rol requerido. En src/courses/courses.controller.ts ya se utiliza esta combinación: creación y actualización requieren teacher o admin, y eliminación requiere admin. Puedes usar DELETE /courses/:id como la operación administrativa para demostrar el requisito.')
numbered(['Ubica el método remove() de CoursesController.', 'Confirma que tenga @UseGuards(JwtAuthGuard, RolesGuard) y @Roles(UserRole.ADMIN).', 'No elimines el guard JWT: el control de rol debe ejecutarse sobre una identidad previamente autenticada.', 'Si tu profesor exige una ruta administrativa nueva y exclusiva, crea una ruta clara (por ejemplo /admin/...) y protégela con los mismos guards y @Roles(UserRole.ADMIN). Reutiliza la lógica existente en lugar de duplicar operaciones.', 'Prueba sin token: debe responder 401. Prueba con token student o teacher: debe responder 403. Prueba con token admin: debe acceder (o recibir el error funcional esperado, por ejemplo 404 si el ID no existe).', 'Guarda capturas de cada respuesta y anota método, ruta, rol/token de prueba y código HTTP. Nunca incluyas el token completo en el documento.'])
para('Nota técnica: RolesGuard devuelve false cuando la identidad autenticada no tiene uno de los roles autorizados; NestJS responde 403. Un token ausente, vencido o inválido falla antes en JwtAuthGuard y produce 401.')

doc.add_heading('4. Comprueba la propiedad del curso',level=1)
para('Ya implementado en src/courses/courses.service.ts. Al crear un curso, el servicio guarda actor.id en createdByUserId. Al actualizar, permite continuar si el actor es admin o si el actor.id coincide con el propietario del curso; de lo contrario lanza ForbiddenException (403).')
numbered(['Crea o prepara dos usuarios teacher de prueba, A y B.', 'Autentícate como teacher A y crea un curso. Conserva el ID devuelto.', 'Autentícate como teacher B e intenta hacer PATCH /courses/{id-de-A}. Debe responder 403.', 'Autentícate como teacher A y actualiza su propio curso. Debe responder correctamente.', 'Opcionalmente repite con admin: el administrador puede actualizar el curso de A.', 'Incluye en el Word una captura del 403 de B y otra de la actualización permitida al propietario.'])
code('PATCH /courses/ID\nAuthorization: Bearer TOKEN_DEL_DOCENTE_B\nContent-Type: application/json\n\n{"title":"Cambio de prueba"}')

doc.add_heading('5. Limita los intentos de inicio de sesión',level=1)
para('Actualmente AuthController expone POST /auth/login, pero package.json y el código revisado no muestran @nestjs/throttler. La documentación oficial de NestJS recomienda configurar ThrottlerModule y enlazar ThrottlerGuard. Para esta entrega, configura un límite específico para el inicio de sesión y comprueba que el exceso devuelve 429.')
numbered(['En una terminal abierta en la raíz del proyecto, instala el paquete: npm install @nestjs/throttler.', 'En src/app.module.ts importa ThrottlerModule desde @nestjs/throttler y añádelo al arreglo imports con una ventana y límite globales razonables. Ejemplo:'])
code("ThrottlerModule.forRoot({\n  throttlers: [{ ttl: 60000, limit: 100 }],\n})")
para('El límite global de ejemplo deja margen al resto de la API; en el inicio de sesión se establece una regla más estricta. En src/auth/auth.controller.ts importa UseGuards y, además, ThrottlerGuard y Throttle desde @nestjs/throttler. Aplica el guard y el decorador al método login():')
code("@UseGuards(ThrottlerGuard)\n@Throttle({ default: { limit: 5, ttl: 60000 } })\n@Post('login')\n@HttpCode(HttpStatus.OK)\nlogin(@Body() dto: LoginDto) {\n  return this.authService.login(dto);\n}")
para('Si la combinación de guard y regla global de la versión instalada se comporta de forma distinta, sigue la sección Rate Limiting de la documentación oficial enlazada al final y confirma el límite con una petición real. Los valores son una política de ejemplo para desarrollo y se deben ajustar a la actividad.')
numbered(['Reinicia la aplicación para cargar la configuración.', 'Envía seis o más solicitudes seguidas a POST /auth/login dentro de un minuto. Puedes usar credenciales de prueba incorrectas.', 'Comprueba que al superar el límite la respuesta HTTP sea 429 Too Many Requests. Espera que finalice la ventana antes de repetir.', 'No hagas pruebas contra sistemas públicos o cuentas reales. Guarda una captura de la respuesta 429 y explica el límite configurado.'])

doc.add_heading('6. Configura CORS con una lista permitida',level=1)
para('src/main.ts no llama actualmente a enableCors(). Declara explícitamente los orígenes que sí necesitan consumir la API. Un origen incluye esquema, host y puerto; por ejemplo http://localhost:5173. No uses origin: true ni * para cumplir el requisito de lista documentada.')
numbered(['Agrega CORS_ORIGINS al archivo .env.example (sin credenciales), por ejemplo:'])
code('CORS_ORIGINS=http://localhost:5173,https://app.ejemplo.edu')
para('Sustituye los ejemplos por los orígenes reales de tu frontend y por el entorno indicado por tu docente. Si solo trabajas localmente, documenta únicamente el origen local.')
numbered(['En src/main.ts, obtén ConfigService como ya se hace para PORT.', 'Lee CORS_ORIGINS, sepáralo por comas, aplica trim a cada elemento y elimina entradas vacías.', 'Llama a app.enableCors({ origin: allowedOrigins }). Si no hay orígenes configurados, falla al iniciar o deja una lista vacía; no abras CORS a todos.', 'Escribe en README qué orígenes están permitidos y para qué entorno.', 'Prueba desde el origen permitido y desde un origen distinto. Comprueba que el navegador permita la primera petición y bloquee el acceso de lectura desde el origen no permitido. Una llamada con curl no aplica la política CORS del navegador, por lo que no basta por sí sola como prueba.'])
code("const allowedOrigins = config\n  .getOrThrow<string>('CORS_ORIGINS')\n  .split(',')\n  .map((origin) => origin.trim())\n  .filter(Boolean);\napp.enableCors({ origin: allowedOrigins });")

doc.add_heading('7. Documenta HTTPS y TLS para producción',level=1)
para('El README actual explica cómo ejecutar la API localmente con HTTP. Eso puede seguir siendo útil para desarrollo, pero agrega una sección de producción que declare HTTPS/TLS como requisito. En muchas implementaciones TLS termina en un proxy inverso o plataforma de alojamiento delante de NestJS; explica ese despliegue y exige certificados válidos. No afirmes que el servidor local ya tiene TLS si no lo configuraste.')
para('Texto sugerido para agregar y adaptar en README.md:')
code('## Seguridad de producción\n\nEn producción, la API debe exponerse únicamente mediante HTTPS con TLS vigente. Configure un certificado válido en el proxy inverso o en la plataforma que recibe el tráfico y redirija HTTP a HTTPS. No envíe tokens JWT ni credenciales por conexiones HTTP públicas. El uso de http://localhost durante el desarrollo local no sustituye este requisito.')
para('Acompaña la sección con una captura del README y, si tienes despliegue real, una evidencia del certificado HTTPS. Si el proyecto aún no está desplegado, presenta la configuración documentada como requisito y deja claro que es un requisito de producción.')

doc.add_heading('8. Orden de trabajo y verificación final',level=1)
table([['Orden','Acción','Resultado que debes guardar'],['1','Verificar el rol student predeterminado y registro','Código y evidencia de usuario nuevo'],['2','Verificar JWT + roles en ruta admin','401 sin token, 403 con rol insuficiente y acceso admin'],['3','Demostrar propiedad del curso','403 para docente ajeno; éxito para propietario'],['4','Agregar limitación a POST /auth/login','Respuesta 429 al exceder el límite'],['5','Configurar lista CORS explícita','Origen permitido y origen rechazado desde navegador'],['6','Actualizar README con HTTPS/TLS','Captura de la sección de producción'],['7','Revisar cambios y completar informe','Resumen, evidencias y fuentes']])
para('Al terminar, revisa que .env no se haya agregado a capturas o entregables, que .env.example no contenga secretos, que las rutas y los roles de las capturas sean legibles, y que el README describa el mismo comportamiento que configuraste. Las pruebas manuales son la evidencia principal solicitada aquí; no se ejecutaron cambios ni pruebas sobre el repositorio para elaborar esta guía.')

doc.add_heading('9. Estructura recomendada para tu entrega',level=1)
bullets(['Portada: nombre de la institución, asignatura, tema, estudiante, docente y fecha.', 'Objetivo: explicar que se aplicarán controles de autorización y defensa en profundidad a CourseHub API.', 'Desarrollo: resume los seis requisitos y qué verificaste o añadiste en cada uno.', 'Evidencias: capturas numeradas, con una frase debajo que indique la acción y el resultado HTTP.', 'Conclusión: explica cómo el mínimo privilegio, JWT, roles, propiedad, CORS, rate limit y TLS reducen riesgos distintos.', 'Fuentes: incluye la sesión del curso y la documentación oficial consultada.'])

doc.add_heading('Fuentes',level=1)
para('Proyecto revisado: README.md y archivos src/users/user-role.enum.ts, src/users/entities/user.entity.ts, src/auth/auth.controller.ts, src/auth/jwt-auth.guard.ts, src/auth/roles.guard.ts, src/courses/courses.controller.ts, src/courses/courses.service.ts y src/main.ts.')
para('Sesión indicada por el estudiante: https://epanchanaf.github.io/nestjs-course/semana-10/sesion-20')
para('Documentación oficial de NestJS para limitación de solicitudes: https://docs.nestjs.com/security/rate-limiting')
para('La página de la sesión no se pudo recuperar durante la elaboración. La guía interpreta los requisitos visibles en la imagen y los contrasta con el código del repositorio; verifica si tu docente añadió criterios en la página del curso.')

# footer page number field
for section in doc.sections:
 f=section.footer.paragraphs[0]; f.alignment=WD_ALIGN_PARAGRAPH.CENTER
 run=f.add_run('CourseHub API  |  Guía de implementación manual  |  '); run.font.size=Pt(8); run.font.color.rgb=RGBColor(100,110,120)
 fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); f._p.append(fld)

doc.core_properties.title='Autorización y defensa en profundidad para CourseHub API'
doc.core_properties.subject='Guía paso a paso de implementación manual y evidencias'
doc.core_properties.author=''
doc.save(out)
print(out)

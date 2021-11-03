// @APIVersion 1.0.0
// @Title beego Test API
// @Description beego has a very cool tools to autogenerate documents for your API
// @Contact astaxie@gmail.com
// @TermsOfServiceUrl http://beego.me/
// @License Apache 2.0
// @LicenseUrl http://www.apache.org/licenses/LICENSE-2.0.html
package routers

import (
	"back/controllers"

	beego "github.com/beego/beego/v2/server/web"
)

func init() {
	ns := beego.NewNamespace("/api",
		beego.NSNamespace("/user",
			beego.NSRouter("/create", &controllers.UserController{}, "post:CreateOne"),
			beego.NSRouter("/all", &controllers.UserController{}, "get:GetAllUsers"),
			beego.NSRouter("/:uid", &controllers.UserController{}, "get:GetOneUser"),
			beego.NSRouter("/:uid", &controllers.UserController{}, "put:UpdateOne"),
			beego.NSRouter("/login", &controllers.UserController{}, "get:Login"),
		),
	)
	beego.AddNamespace(ns)
}

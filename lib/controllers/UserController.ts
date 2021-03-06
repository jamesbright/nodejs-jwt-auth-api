import * as mongoose from 'mongoose';
import { UserSchema } from '../models/userModel';
import { TokenSchema } from '../models/tokenModel';
import { RoleSchema } from '../models/roleModel';
import { TrashSchema } from '../models/trashModel';
import { LogSchema } from '../models/logModel';
import { Request, Response } from 'express';
import { UserI } from '../interfaces/user';
import { TokenI } from '../interfaces/token';
import { RoleI } from '../interfaces/role';
import { TrashI } from '../interfaces/trash';
import { LogI } from '../interfaces/log';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { NodeMailgun } from 'ts-mailgun';
import * as dotenv from 'dotenv';
// initialize configuration
dotenv.config();

//Create an instance of  user model
const User = mongoose.model<UserI>('User', UserSchema);
//index user documents to enable searching
User.createIndexes();

//Create an instance of role model
const Role = mongoose.model<RoleI>('Role', RoleSchema);

//Create an instance of token model
const Token = mongoose.model<TokenI>('Token', TokenSchema);
//Create an instance of trash model
const Trash = mongoose.model<TrashI>('Trash', TrashSchema);

//Create an instance of log model
const Log = mongoose.model<LogI>('Log', LogSchema);


class UserController {




  public getAllUsers(req: Request, res: Response): void {

    let status: string,
      message: string,
      code: number;

    // get limit and page number from request
    const currentPage: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 5;
    const orderBy: number = Number(req.query.orderBy) || 1;
    const sortBy: string = req.query.sortBy as string || 'firstName';
    let hasNext: boolean,
      hasPrev: boolean,
      query: object;
    if (req.query.search) {

      const search = req.query.search;
      //query to search for text
      query = { $text: { $search: search } };
    } else {
      query = null
    }

    try {
      //sort by firstname in ascending order
      const sort = { [sortBy]: orderBy };

      User.find(query, async function (err: any, users: any) {
        // get total documents in the User collection 
        const count: number = await User.countDocuments();
        let totalPages: number;
        if (err) {
          code = 500;
          status = "Server error";
          message = "There was a problem with the server.";
          totalPages = 0;
        } else {
          if (users.length == 0) {
            code = 404;
            status = "Not found";
            message = "Users not found";
            totalPages = 0;
          } else {
            code = 200;
            status = "Success";
            message = "Endpoint returned successfully";
            totalPages = Math.ceil(count / limit);

          }
        }

        if (currentPage > 1)
          hasPrev = true;
        else
          hasPrev = false;

        if (totalPages > currentPage)
          hasNext = true;
        else
          hasNext = false;

        //calculate values for previous and next page
        const prevPage: number = Number(currentPage) - 1;
        const nextPage: number = Number(currentPage) + 1;

        //pagination object with all pagination values
        const pagination: Record<string, unknown> = {
          'totalPages': totalPages,
          'currentPage': currentPage,
          'users': count,
          'hasNext': hasNext,
          'hasPrev': hasPrev,
          'perPage': limit,
          'prevPage': prevPage,
          'nextPage': nextPage
        }
        //get current and next url
        const links: Record<string, unknown> = {
          'nextLink': `${req.protocol}://${req.get('host')}/api/users/get?page=${nextPage}&limit=${limit}`,
          'prevLink': `${req.protocol}://${req.get('host')}/api/users/get?page=${prevPage}&limit=${limit}`
        };
        // return response with posts, calculated total pages, and current page
        return res.status(code).send({ users, pagination: pagination, status: status, code: code, message: message, links: links });



      }).populate("roles", "-__v")
        .limit(limit * 1)//prevPage = (currentPage - 1) * limit
        .skip((currentPage - 1) * limit)
        .sort(sort) //sort by firstname
        .select('-password') //do not select password
        .exec();

    } catch (err) {
      console.error(err.message);
    }
  }



  public getAllLogs(req: Request, res: Response): void {

    let status: string,
      message: string,
      code: number;

    // get limit and page number from request
    const currentPage: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 5;
    const orderBy: number = Number(req.query.orderBy) || 1;
    const sortBy: string = req.query.sortBy as string || 'name';
    let hasNext: boolean,
      hasPrev: boolean,
      query: object;
    if (req.query.search) {

      const search = req.query.search;
      //query to search for text
      query = { $text: { $search: search } };
    } else {
      query = null
    }

    try {
      //sort by firstname in ascending order
      const sort = { [sortBy]: orderBy };

     Log.find(query, async function (err: any, logs: any) {
        // get total documents in the User collection 
        const count: number = await Log.countDocuments();
        let totalPages: number;
        if (err) {
          code = 500;
          status = "Server error";
          message = "There was a problem with the server.";
          totalPages = 0;
        } else {
          if (logs.length == 0) {
            code = 404;
            status = "Not found";
            message = "logs not found";
            totalPages = 0;
          } else {
            code = 200;
            status = "Success";
            message = "Endpoint returned successfully";
            totalPages = Math.ceil(count / limit);

          }
        }

        if (currentPage > 1)
          hasPrev = true;
        else
          hasPrev = false;

        if (totalPages > currentPage)
          hasNext = true;
        else
          hasNext = false;

        //calculate values for previous and next page
        const prevPage: number = Number(currentPage) - 1;
        const nextPage: number = Number(currentPage) + 1;

        //pagination object with all pagination values
        const pagination: Record<string, unknown> = {
          'totalPages': totalPages,
          'currentPage': currentPage,
          'logs': count,
          'hasNext': hasNext,
          'hasPrev': hasPrev,
          'perPage': limit,
          'prevPage': prevPage,
          'nextPage': nextPage
        }
        //get current and next url
        const links: Record<string, unknown> = {
          'nextLink': `${req.protocol}://${req.get('host')}/api/logs/get?page=${nextPage}&limit=${limit}`,
          'prevLink': `${req.protocol}://${req.get('host')}/api/logs/get?page=${prevPage}&limit=${limit}`
        };
        // return response with posts, calculated total pages, and current page
        return res.status(code).send({ logs, pagination: pagination, status: status, code: code, message: message, links: links });



      })
        .limit(limit * 1)//prevPage = (currentPage - 1) * limit
        .skip((currentPage - 1) * limit)
        .sort(sort) //sort by firstname
        .select('-password') //do not select password
        .exec();

    } catch (err) {
      console.error(err.message);
    }
  }



  public getAllRoles(req: Request, res: Response): void {

    let status: string,
      message: string,
      code: number;

    try {
  
      Role.find({}, async function (err: any, roles: any) {
        // get total documents in the Logs collection 
  
        if (err) {
          code = 500;
          status = "Server error";
          message = "There was a problem with the server.";
        
        } else {
          if (roles.length == 0) {
            code = 404;
            status = "Not found";
            message = "Roles not found";
           
          } else {
            code = 200;
            status = "Success";
            message = "Endpoint returned successfully";
          }
        }

        // return response with logs, calculated total pages, and current page
        return res.status(code).send({ roles:roles, status: status, code: code, message: message });
      }).populate("permissions", "-__v")
        .exec();

    } catch (err) {
      console.error(err.message);
    }
  }

  public getUserLogs(req: Request, res: Response): void{
    let status: string,
      message: any,
      code: number;
    Log.find({user:req.params.userId },
      (err: any, logs: Record<string, unknown>) => {
        if (err) {
          return res.status(500).send({ status: "Server error", code: 500, message: err });
        }
        if (logs == null) {
          return res.status(404).send({ status: "Not found", code: 404, message: "Logs not available" });
        }
        status = 'success';
        message = "Endpoint returned successfully";
        code = 200;
        return res.status(code).send({ logs:logs, status: status, code: code, message: message });

      })
    
    
}

  public assignRole(req: Request, res: Response): void {

    let status: string,
      message: any,
      code: number;
    //find user using their id
    User.findById(req.params.userId, function (err, user) {
      if (err) {
        code = 500;
        status = "Server error";
        message = "There was a problem with the server.";
        return res.status(code).send({ status: status, code: code, message: message });

      } else {
        if (!user) {
          code = 404;
          status = "Not found";
          message = "User not found";
          return res.status(code).send({ status: status, code: code, message: message });
        } else {

          if (req.body.roles) {
            try {
              const userRoles: Array<string> = ['user', 'admin', 'superAdmin'];
              for (let i = 0; i < req.body.roles.length; i++) {
                //if roles sent from endpoint does not exist in collection return error
                if (!userRoles.includes(req.body.roles[i])) {
                  return res.status(400).send({ status: "bad request", code: 400, message: `Role ${req.body.roles[i]} does not exist or Role is not an array!` });
                }

              }
            } catch (err) {
              console.log(err);
            }
            // find all roles from role collection that matches user roles from request
            Role.find(
              {
                name: { $in: req.body.roles }
              },
              (err: any, roles: Record<string, unknown>) => {
                if (err) {
                  return res.status(500).send({ status: "Server error", code: 500, message: err });

                }
                if (roles == null) {
                  return res.status(404).send({ status: "Not found", code: 404, message: "Roles not available" });

                }

                const assignableRoles: string[] = [];
                Object.keys(roles).forEach((key: string) => {
                  assignableRoles.push(roles[key]['_id']);
                });

                //find roles not yet assigned to user
                let notAssigned: string[] = [];
                notAssigned = assignableRoles.filter(element => !user.roles.includes(element))


                //if role is not yet assigned to user, then assign role.
                if (notAssigned.length > 0) {
                  notAssigned.forEach((role: string) => {
                    user.roles.push(role);
                    Log.create({
                      name: 'AssignRole',
                      user: user._id,
                      description: `successfully assigned ${role} to ${user.firstName} ${user.lastName}`,
                    }, (err, log) => {
                      log.save();
                    });
                  })
                } else {
                  return res.status(400).send({ status: "bad request", code: 400, message: "Role already assigned to user" });

                }

                //save the result
                user.save(err => {
                  if (err) {
                    return res.status(500).send({ status: "Server error", code: 500, message: err });

                  }
                 
                  code = 200;
                  status = "Success";
                  message = "Successfully assigned roles to user";
                  return res.status(code).send({ user: user, status: status, code: code, message: message });

                });
              }
            );
          } else {
            // no roles was sent from endpoint
            code = 400;
            status = "bad request";
            message = "no roles was provided.";
            return res.status(code).send({ user: user, status: status, code: code, message: message });

          }

        }
      }

    }).select('-password'); //do not include password
  }



  public unAssignRole(req: Request, res: Response): void {

    let status: string,
      message: any,
      code: number;
    //find user using their id
    User.findById(req.params.userId, function (err, user) {
      if (err) {
        code = 500;
        status = "Server error";
        message = "There was a problem with the server.";
        return res.status(code).send({ status: status, code: code, message: message });

      } else {
        if (!user) {
          code = 404;
          status = "Not found";
          message = "User not found";
          return res.status(code).send({ status: status, code: code, message: message });
        } else {

          if (req.body.roles) {
            try {
              const userRoles: Array<string> = ['user', 'admin', 'superAdmin'];
              for (let i = 0; i < req.body.roles.length; i++) {
                //if roles sent from endpoint does not exist in collection return error
                if (!userRoles.includes(req.body.roles[i])) {
                  return res.status(400).send({ status: "bad request", code: 400, message: `Role ${req.body.roles[i]} does not exist or Role is not an array!` });
                }

              }
            } catch (err) {
              console.log(err);
            }
            // find all roles from role collection that matches user roles from request
            Role.find(
              {
                name: { $in: req.body.roles }
              },
              (err: any, roles: Record<string, unknown>) => {
                if (err) {
                  return res.status(500).send({ status: "Server error", code: 500, message: err });

                }
                if (roles == null) {
                  return res.status(404).send({ status: "Not found", code: 404, message: "Roles not available" });

                }

          
                    user.roles.removeAll(roles);
               
               
                //save the result
                user.save(err => {
                  if (err) {
                    return res.status(500).send({ status: "Server error", code: 500, message: err });

                  }
                  User.find(function (err: any, users: any) {
                    if (err) {
                      return res.status(500).send({ status: "Server error", code: 500, message: err });
                    }
                    Log.create({
                      name: 'UnAssignRoles',
                      user: user._id,
                      description: `successfully unassigned ${[roles]} to ${user.firstName} ${user.lastName}`,
                    }, (err, log) => {
                      log.save();
                    });
                    code = 200;
                    status = "Success";
                    message = "User roles successfully removed";
                    return res.status(code).send({ users: users, status: status, code: code, message: message });
                  });
                
                });
              }
            );
          } else {
            // no roles was sent from endpoint
            code = 400;
            status = "bad request";
            message = "no roles was provided.";
            return res.status(code).send({ user: user, status: status, code: code, message: message });

          }

        }
      }

    }).select('-password'); //do not include password
  }


  public getUserWithID(req: Request, res: Response): void {

    let status: string,
      message: any,
      code: number;
    //find user using their id
    User.findById(req.params.userId, function (err, user) {
      if (err) {
        code = 500;
        status = "Server error";
        message = "There was a problem with the server.";
      } else {
        if (!user) {
          code = 404;
          status = "Not found";
          message = "User not found";
        } else {
          code = 200;
          status = "Success";
          message = "Endpoint returned successfully";
        }
      }
      return res.status(code).send({ user: user, status: status, code: code, message: message });

    }).populate("roles", "-__v")
      .select('-password'); //do not include password
  }

  public updateUser(req: Request, res: Response): void {

    let status: string,
      message: any,
      code: number;
    //find user by their id and update the new values subsequently
    User.findOneAndUpdate({ _id: req.params.userId }, req.body, { new: true }, function (err, user) {
      if (err) {
        code = 500;
        status = "Server error";
        message = "There was a problem with the server.";
      }
      if (!user) {
        code = 404;
        status = "Not found";
        message = "User not found";
      } else {

        //create log of event
        Log.create({
          name: 'Update',
          user: user._id,
          description: 'successfully updated details',
        }, (err, log) => {
          log.save();
        });
        code = 200;
        status = "Success";
        message = "User updated successfully";
      }
      return res.status(code).send({ user: user, status: status, code: code, message: message });

    }).select('-password');


  }


  public softDeleteUser(req: Request, res: Response): void {

    let status: string,
      message: any,
      code: number;
    //find user by their id and update the new values subsequently
    User.findById({ _id: req.params.userId }, async function (err, user) {
      if (err) {
        code = 500;
        status = "Server error";
        message = "There was a problem with the server.";
      } else {
        if (!user) {
          code = 404;
          status = "Not found";
          message = "User not found";
        } else {

          //save to trash
          let collectionName: string = "User";
          let collectionObject: object = user;
          let softDelete = new Trash({ collectionName, collectionObject });
          await softDelete.save();
          await User.deleteOne(user);

          //add event to log
          Log.create({
            name: 'TrashUser',
            user: user._id,
            description: `successfully moved to trash`,
          }, (err, log) => {
            log.save();
          });
          code = 200;
          status = "Success";
          message = "User removed successfully";

        }
      }

      return res.status(code).send({ status: status, code: code, message: message });
    });

  }


  public deleteUser(req: Request, res: Response): void {

    let status: string,
      message: any,
      code: number;
    //find user by their id and update the new values subsequently
    User.findByIdAndRemove({ _id: req.params.userId }, {}, function (err, user) {
      if (err) {
        code = 500;
        status = "Server error";
        message = "There was a problem with the server.";
      }
      if (!user) {
        code = 404;
        status = "Not found";
        message = "User not found";
      } else {
        //add event to log
        Log.create({
          name: 'DeleteUser',
          user: user._id,
          description: `successfully removed`,
        }, (err, log) => {
          log.save();
        });
        code = 200;
        status = "Success";
        message = "User removed successfully";
      }


      return res.status(code).send({ status: status, code: code, message: message });

    });


  }

  public async activateUser(req: Request, res: Response): Promise<any> {

    let status: string,
      message: any,
      code: number;
    //find user by their id and set active to true subsequently
   const user = await User.findById({ _id: req.params.userId });
    //find user by their id and set active to true subsequently
    User.findByIdAndUpdate({ _id: req.params.userId }, { active: !user.active },
      { new: true }, function (err, user) {
        if (err) {
          code = 500;
          status = "Server error";
          message = "There was a problem with the server.";
        }
        if (!user) {
          code = 404;
          status = "Not found";
          message = "User not found";
        } else {

          code = 200;
          status = "Success";
          if (user.active == true) {
            
            //add event to log
            Log.create({
              name: 'Activate',
              user: user._id,
              description: `successfully activated`,
            }, (err, log) => {
              log.save();
            });
            message = "User activated successfully";
          }
          else {
            //add event to log
            Log.create({
              name: 'DeActivate',
              user: user._id,
              description: `successfully deactivated`,
            }, (err, log) => {
              log.save();
            });
            message = "User deactivated successfully";
          }
        }


        return res.status(code).send({ user: user, status: status, code: code, message: message });

      }).select('-password');
  }




  public async requestPasswordReset(req: Request, res: Response): Promise<any> {
    let status: string,
      message: any,
      code: number;

    //find user requesting for password reset using their email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      code = 404;
      status = "Not found";
      message = "User not found";
      return res.status(code).send({ status: status, code: code, message: message });


    } else {
      //check if previous token generated for user exists
      const token: TokenI = await Token.findOne({ user: user._id });
      //if previous token exists then delete it first
      if (token) await token.deleteOne();
      //generate and hash a new password reset token
      const resetToken: string = crypto.randomBytes(32).toString("hex");
      const hashedToken: string = await bcrypt.hash(resetToken, Number(process.env.BCRYPT_SALT));
      //save the generated token
      await new Token({
        user: user._id,
        token: hashedToken,
        createdAt: Date.now(),
      }).save();

      //send email to user
      const mailer: NodeMailgun = new NodeMailgun();
      mailer.apiKey = process.env.MAILER_API_KEY; //mailgun API key
      mailer.domain = process.env.MAILER_API_DOMAIN; // domain you registered with mailgun
      mailer.fromEmail = process.env.MAILER_FROM_EMAIL; // from email
      mailer.fromTitle = process.env.MAILER_FROM_TITLE; // name you would like to send from

      mailer.init();

      const clientURL: string = process.env.CLIENT_URL;//frontend domain name
      const userEmail: string = user.email; //user's email address to send email to
      const link = `${clientURL}/reset-password?token=${resetToken}&userId=${user._id}`;// passwordReset endpoint

      //message to be displayed to user
      const body = `<h1> <p>Hi ${user.firstName},</p>
        <p>You requested to reset your password.</p>
        <p> Please, click the link below to reset your password</p>
        <a href=${link}>Reset Password</a>`;

      console.log('sending mail');
      //send mail
      try {
        await mailer
          .send(userEmail, 'password reset request', body)
          .then((result) => {
            //add event to log
            Log.create({
              name: 'RequestPasswordReseset',
              user: user._id,
              description: `requested for password reset`,
            }, (err, log) => {
              log.save();
            });
            code = 200;
            status = "Success";
            message = `email with instructions on how to reset your password successfully sent to ${userEmail}`;

            console.log('Done', result)
          })
          .catch((error) => {
            code = 401;
            status = "Forbidden";
            message = `Email not sent, please try again later`;
            console.error('Error: ', error)
          })
        return res.status(code).send({ status: status, code: code, message: message });

      } catch (err) {
        console.log(err);
      }
    }
  }


  public async passwordReset(req: Request, res: Response): Promise<any> {
    let status: string,
      message: any,
      code: number;

    const userId: string = req.body.userId;
    const token: string = req.body.token;
    const password: string = req.body.password;
    //get user's password reset token 
    const passwordResetToken: TokenI = await Token.findOne({ user: userId });

    console.log("token", passwordResetToken);
    if (!passwordResetToken) {
      code = 404;
      status = "Not found";
      message = "Password token not found";
      return res.status(code).send({ status: status, code: code, message: message });


    } else {

      //check if reset token is valid
      const isValidToken: boolean = await bcrypt.compare(token, passwordResetToken.token);
      
      if (!isValidToken) {

        console.log(token, passwordResetToken.token);
        code = 400;
        status = "bad request";
        message = "Password token is not valid";
        return res.status(code).send({ status: status, code: code, message: message });

      } else {
        //hash new user password
        const hashedPassword: string = bcrypt.hashSync(password, Number(process.env.BCRYPT_SALT));

        //save new password
        await User.updateOne(
          { _id: userId },
          { $set: { password: hashedPassword } },
          { new: true }
        );
        const user: UserI = await User.findById({ _id: userId });

        //send email to user notifying them of password reset

        const mailer: NodeMailgun = new NodeMailgun();
        mailer.apiKey = process.env.MAILER_API_KEY; // API key
        mailer.domain = process.env.MAILER_API_DOMAIN; // domain you registered
        mailer.fromEmail = process.env.MAILER_FROM_EMAIL; // from email
        mailer.fromTitle = process.env.MAILER_FROM_TITLE; // name you would like to send from

        mailer.init();

        const email: string = user.email; // user's email address
        // message as seen by user
        const body = `<h1> <p>Hi ${user.firstName},</p>
        <p>Your password reset was successful.</p>`;

        await mailer
          .send(email, 'password reset successful', body)
          .then((result) => console.log('Done sending mail', result))
          .catch((error) => console.error('Error: ', error))

        //when done delete user's password reset token fron db
        await passwordResetToken.deleteOne();
        //add event to log
        Log.create({
          name: 'PasswordReseset',
          user: user._id,
          description: `successfully reset password`,
        }, (err, log) => {
          log.save();
        });
        code = 200;
        status = "Success";
        message = 'password reset successful';

      }
      return res.status(code).send({ status: status, code: code, message: message });

    }
  }


}

export { UserController }